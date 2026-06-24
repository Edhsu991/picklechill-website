import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "picklechill-tournament-v1";
const EDIT_MODE_PIN = "2468";
const CATEGORIES = [
  { id: "mens", name: "男雙", englishName: "MEN'S DOUBLES" },
  { id: "womens", name: "女雙", englishName: "WOMEN'S DOUBLES" },
  { id: "mixed", name: "混雙", englishName: "MIXED DOUBLES" },
];

function makeTeams(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `team-${index + 1}`,
    name: `隊伍 ${String(index + 1).padStart(2, "0")}`,
  }));
}

function groupLabel(index) {
  let value = index + 1;
  let label = "";

  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }

  return label;
}

function distributeTeams(teams, preferredSize, roundNumber = 1) {
  let groupCount = Math.ceil(teams.length / preferredSize);
  while (groupCount > 1 && Math.floor(teams.length / groupCount) < 2) groupCount -= 1;
  const baseSize = Math.floor(teams.length / groupCount);
  const largerGroupCount = teams.length % groupCount;
  let teamIndex = 0;

  return Array.from({ length: groupCount }, (_, index) => {
    const size = baseSize + (index < largerGroupCount ? 1 : 0);
    const group = {
      id: `round-${roundNumber}-group-${index + 1}`,
      name: `第 ${groupLabel(index)} 組`,
      teams: teams.slice(teamIndex, teamIndex + size),
    };
    teamIndex += size;
    return group;
  });
}

function getGroupPlan(teamCount, preferredSize) {
  if (teamCount < 2) {
    return {
      groupCount: 0,
      distribution: "至少需要 2 隊",
      matchCount: 0,
    };
  }

  const groups = distributeTeams(makeTeams(teamCount), preferredSize);
  const sizeCounts = groups.reduce((counts, group) => {
    counts[group.teams.length] = (counts[group.teams.length] ?? 0) + 1;
    return counts;
  }, {});
  const distribution = Object.entries(sizeCounts)
    .sort(([sizeA], [sizeB]) => Number(sizeB) - Number(sizeA))
    .map(([size, count]) => `${count} 組 ${size} 隊`)
    .join("、");

  return {
    groupCount: groups.length,
    distribution,
    matchCount: groups.reduce(
      (total, group) => total + (group.teams.length * (group.teams.length - 1)) / 2,
      0,
    ),
  };
}

function makeMatches(groups, roundNumber = 1) {
  return groups.flatMap((group) => {
    const matches = [];

    for (let home = 0; home < group.teams.length; home += 1) {
      for (let away = home + 1; away < group.teams.length; away += 1) {
        matches.push({
          id: `round-${roundNumber}-${group.id}-${group.teams[home].id}-${group.teams[away].id}`,
          groupId: group.id,
          homeId: group.teams[home].id,
          awayId: group.teams[away].id,
          homeScore: "",
          awayScore: "",
          venue: "",
        });
      }
    }

    return matches;
  });
}

function createRound(teams, groupSize, roundNumber) {
  const groups = distributeTeams(teams, groupSize, roundNumber);

  return {
    id: `round-${roundNumber}`,
    number: roundNumber,
    name: `第 ${roundNumber} 輪`,
    groups,
    matches: makeMatches(groups, roundNumber),
  };
}

function createTournament(teamCount, groupSize) {
  const teams = makeTeams(teamCount);

  return {
    teams,
    rounds: [createRound(teams, groupSize, 1)],
  };
}

function normalizeTournament(saved) {
  if (saved?.teams && saved?.rounds?.length) return saved;
  if (saved?.teams && saved?.groups && saved?.matches) {
    return {
      teams: saved.teams,
      rounds: [{
        id: "round-1",
        number: 1,
        name: "第 1 輪",
        groups: saved.groups,
        matches: saved.matches,
      }],
    };
  }

  return null;
}

function readSavedCompetitions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.competitions) {
      return {
        mens: normalizeTournament(saved.competitions.mens) ?? createTournament(3, 3),
        womens: normalizeTournament(saved.competitions.womens) ?? createTournament(3, 3),
        mixed: normalizeTournament(saved.competitions.mixed) ?? createTournament(3, 3),
      };
    }

    const existingTournament = normalizeTournament(saved);
    if (existingTournament) {
      return {
        mens: existingTournament,
        womens: createTournament(3, 3),
        mixed: createTournament(3, 3),
      };
    }
  } catch {
    // Ignore invalid local data and start with clean competitions.
  }

  return {
    mens: createTournament(3, 3),
    womens: createTournament(3, 3),
    mixed: createTournament(3, 3),
  };
}

function isGroupComplete(group, matches) {
  const groupMatches = matches.filter((match) => match.groupId === group.id);
  return groupMatches.length > 0 && groupMatches.every(isCompleted);
}

function winnersForRound(round) {
  if (!round.groups.every((group) => isGroupComplete(group, round.matches))) return [];

  return round.groups.map((group) => standingsFor(group, round.matches)[0]);
}

function isCompleted(match) {
  return (
    match.homeScore !== "" &&
    match.awayScore !== "" &&
    Number(match.homeScore) !== Number(match.awayScore)
  );
}

function splitByValue(items, getValue) {
  const groups = [];

  items.forEach((item) => {
    const value = getValue(item);
    const lastGroup = groups.at(-1);

    if (lastGroup && Object.is(lastGroup.value, value)) {
      lastGroup.items.push(item);
    } else {
      groups.push({ value, items: [item] });
    }
  });

  return groups;
}

function completedMatchesForTeamSet(matches, groupId, teamIds) {
  return matches.filter(
    (match) =>
      match.groupId === groupId &&
      isCompleted(match) &&
      teamIds.has(match.homeId) &&
      teamIds.has(match.awayId),
  );
}

function applyTieBreakers(rows, matches, groupId) {
  const sortByOriginalOrder = (items) => [...items].sort((a, b) => a.originalIndex - b.originalIndex);

  const resolveTiedRows = (tiedRows) => {
    if (tiedRows.length <= 1) return tiedRows;

    const teamIds = new Set(tiedRows.map((row) => row.id));
    const relatedMatches = completedMatchesForTeamSet(matches, groupId, teamIds);
    const headToHeadWins = Object.fromEntries(tiedRows.map((row) => [row.id, 0]));

    relatedMatches.forEach((match) => {
      const homeScore = Number(match.homeScore);
      const awayScore = Number(match.awayScore);

      if (homeScore > awayScore) {
        headToHeadWins[match.homeId] += 1;
      } else {
        headToHeadWins[match.awayId] += 1;
      }
    });

    return splitByValue(
      [...tiedRows].sort(
        (a, b) => headToHeadWins[b.id] - headToHeadWins[a.id] || a.originalIndex - b.originalIndex,
      ),
      (row) => headToHeadWins[row.id],
    ).flatMap((headToHeadGroup) => {
      if (headToHeadGroup.items.length <= 1) return headToHeadGroup.items;

      const remainingIds = new Set(headToHeadGroup.items.map((row) => row.id));
      const remainingMatches = completedMatchesForTeamSet(matches, groupId, remainingIds);
      const relatedConceded = Object.fromEntries(headToHeadGroup.items.map((row) => [row.id, 0]));

      remainingMatches.forEach((match) => {
        relatedConceded[match.homeId] += Number(match.awayScore);
        relatedConceded[match.awayId] += Number(match.homeScore);
      });

      return splitByValue(
        [...headToHeadGroup.items].sort(
          (a, b) => relatedConceded[a.id] - relatedConceded[b.id] || a.originalIndex - b.originalIndex,
        ),
        (row) => relatedConceded[row.id],
      ).flatMap((concededGroup) => {
        if (concededGroup.items.length <= 1) return concededGroup.items;

        return sortByOriginalOrder(concededGroup.items).map((row) => ({
          ...row,
          needsDraw: true,
        }));
      });
    });
  };

  return splitByValue(
    [...rows].sort((a, b) => b.wins - a.wins || a.originalIndex - b.originalIndex),
    (row) => row.wins,
  ).flatMap((winGroup) =>
    splitByValue(
      [...winGroup.items].sort(
        (a, b) => b.difference - a.difference || a.originalIndex - b.originalIndex,
      ),
      (row) => row.difference,
    ).flatMap((differenceGroup) => resolveTiedRows(differenceGroup.items)),
  );
}

function standingsFor(group, matches) {
  const rows = group.teams.map((team, index) => ({
    ...team,
    originalIndex: index,
    played: 0,
    wins: 0,
    losses: 0,
    scored: 0,
    conceded: 0,
    difference: 0,
    needsDraw: false,
  }));
  const rowById = Object.fromEntries(rows.map((row) => [row.id, row]));

  matches.filter((match) => match.groupId === group.id && isCompleted(match)).forEach((match) => {
    const home = rowById[match.homeId];
    const away = rowById[match.awayId];
    const homeScore = Number(match.homeScore);
    const awayScore = Number(match.awayScore);

    home.played += 1;
    away.played += 1;
    home.scored += homeScore;
    home.conceded += awayScore;
    away.scored += awayScore;
    away.conceded += homeScore;

    if (homeScore > awayScore) {
      home.wins += 1;
      away.losses += 1;
    } else {
      away.wins += 1;
      home.losses += 1;
    }
  });

  rows.forEach((row) => {
    row.difference = row.scored - row.conceded;
  });

  return applyTieBreakers(rows, matches, group.id);
}

export default function TournamentScoring() {
  const [competitions, setCompetitions] = useState(readSavedCompetitions);
  const [activeCategory, setActiveCategory] = useState("mens");
  const tournament = competitions[activeCategory];
  const category = CATEGORIES.find((item) => item.id === activeCategory) ?? CATEGORIES[0];
  const [teamCount, setTeamCount] = useState(String(tournament.teams.length));
  const [groupSize, setGroupSize] = useState(
    Math.min(5, Math.max(2, tournament.rounds[0]?.groups[0]?.teams.length ?? 3)),
  );
  const [activeRoundId, setActiveRoundId] = useState(
    tournament.rounds[tournament.rounds.length - 1]?.id,
  );
  const [activeGroupId, setActiveGroupId] = useState(
    tournament.rounds[tournament.rounds.length - 1]?.groups[0]?.id,
  );
  const [nextRoundGroupSize, setNextRoundGroupSize] = useState(3);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCarouselActive, setIsCarouselActive] = useState(false);
  const [showQuickNav, setShowQuickNav] = useState(false);
  const scoringPageRef = useRef(null);
  const stagesRef = useRef(null);
  const workspaceRef = useRef(null);
  const normalizedTeamCount = Number(teamCount) || 0;
  const hasSingleTeam = normalizedTeamCount === 1;
  const canGenerate = normalizedTeamCount >= 2 && normalizedTeamCount <= 60;
  const groupPlan = useMemo(
    () => getGroupPlan(normalizedTeamCount, groupSize),
    [normalizedTeamCount, groupSize],
  );

  const activeRound =
    tournament.rounds.find((round) => round.id === activeRoundId) ?? tournament.rounds[0];
  const activeRoundIndex = tournament.rounds.findIndex((round) => round.id === activeRound.id);
  const activeGroup =
    activeRound.groups.find((group) => group.id === activeGroupId) ?? activeRound.groups[0];
  const activeMatches = activeRound.matches.filter((match) => match.groupId === activeGroup?.id);
  const standings = useMemo(
    () => (activeGroup ? standingsFor(activeGroup, activeRound.matches) : []),
    [activeGroup, activeRound.matches],
  );
  const completedCount = activeMatches.filter(isCompleted).length;
  const groupComplete = activeMatches.length > 0 && completedCount === activeMatches.length;
  const roundWinners = useMemo(() => winnersForRound(activeRound), [activeRound]);
  const roundComplete = roundWinners.length === activeRound.groups.length;
  const isLatestRound = activeRoundIndex === tournament.rounds.length - 1;
  const roundLocked = !isLatestRound;
  const canEditActiveRound = isEditMode && !roundLocked;
  const canCreateNextRound = isLatestRound && roundComplete && roundWinners.length > 1;
  const finalStandings =
    roundComplete && activeRound.groups.length === 1
      ? standingsFor(activeRound.groups[0], activeRound.matches)
      : [];
  const champion = finalStandings[0] ?? null;
  const carouselTargets = useMemo(
    () =>
      CATEGORIES.flatMap((item) =>
        competitions[item.id].rounds.flatMap((round) =>
          round.groups.map((group) => ({
            categoryId: item.id,
            categoryName: item.name,
            roundId: round.id,
            roundName: round.name,
            groupId: group.id,
            groupName: group.name,
          })),
        ),
      ),
    [competitions],
  );
  const activeCarouselIndex = carouselTargets.findIndex(
    (target) =>
      target.categoryId === activeCategory &&
      target.roundId === activeRound.id &&
      target.groupId === activeGroup?.id,
  );

  const persist = (nextTournament) => {
    const nextCompetitions = { ...competitions, [activeCategory]: nextTournament };
    setCompetitions(nextCompetitions);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 2, competitions: nextCompetitions }),
    );
  };

  const exitEditMode = () => {
    setIsEditMode(false);
  };

  const handleGenerate = () => {
    if (!isEditMode || !canGenerate) return;

    const nextTournament = createTournament(normalizedTeamCount, groupSize);
    persist(nextTournament);
    setActiveRoundId(nextTournament.rounds[0]?.id);
    setActiveGroupId(nextTournament.rounds[0]?.groups[0]?.id);
  };

  const handleTeamCountChange = (event) => {
    if (!isEditMode) return;

    const value = event.target.value.replace(/\D/g, "");
    if (value === "") {
      setTeamCount("");
      return;
    }

    setTeamCount(String(Math.min(60, Number(value))));
  };

  const handleTeamName = (teamId, name) => {
    if (!canEditActiveRound) return;

    const teams = tournament.teams.map((team) => (team.id === teamId ? { ...team, name } : team));
    const rounds = tournament.rounds.map((round) => ({
      ...round,
      groups: round.groups.map((group) => ({
        ...group,
        teams: group.teams.map((team) => (team.id === teamId ? { ...team, name } : team)),
      })),
    }));
    persist({ ...tournament, teams, rounds });
  };

  const handleScore = (matchId, field, value) => {
    if (!canEditActiveRound) return;
    const cleanValue = value === "" ? "" : Math.max(0, Number.parseInt(value, 10) || 0);
    const rounds = tournament.rounds.map((round) => (
      round.id === activeRound.id
        ? {
            ...round,
            matches: round.matches.map((match) =>
              match.id === matchId ? { ...match, [field]: cleanValue } : match,
            ),
          }
        : round
    ));
    persist({ ...tournament, rounds });
  };

  const handleVenue = (matchId, venue) => {
    if (!canEditActiveRound) return;
    const rounds = tournament.rounds.map((round) => (
      round.id === activeRound.id
        ? {
            ...round,
            matches: round.matches.map((match) =>
              match.id === matchId ? { ...match, venue } : match,
            ),
          }
        : round
    ));
    persist({ ...tournament, rounds });
  };

  const clearScores = () => {
    if (!canEditActiveRound) return;
    const rounds = tournament.rounds.map((round) => (
      round.id === activeRound.id
        ? {
            ...round,
            matches: round.matches.map((match) => ({
              ...match,
              homeScore: "",
              awayScore: "",
            })),
          }
        : round
    ));
    persist({ ...tournament, rounds });
  };

  const createNextRound = () => {
    if (!isEditMode || !canCreateNextRound) return;

    const roundNumber = tournament.rounds.length + 1;
    const preferredSize = Math.min(
      Math.max(2, nextRoundGroupSize),
      Math.min(5, roundWinners.length),
    );
    const nextRound = createRound(roundWinners, preferredSize, roundNumber);
    persist({ ...tournament, rounds: [...tournament.rounds, nextRound] });
    setActiveRoundId(nextRound.id);
    setActiveGroupId(nextRound.groups[0]?.id);
    setNextRoundGroupSize(Math.min(3, nextRound.groups.length));
  };

  const selectRound = (round) => {
    setActiveRoundId(round.id);
    setActiveGroupId(round.groups[0]?.id);
  };

  const selectCategory = (categoryId) => {
    const nextTournament = competitions[categoryId];
    const latestRound = nextTournament.rounds[nextTournament.rounds.length - 1];
    setActiveCategory(categoryId);
    setTeamCount(String(nextTournament.teams.length));
    setGroupSize(
      Math.min(5, Math.max(2, nextTournament.rounds[0]?.groups[0]?.teams.length ?? 3)),
    );
    setActiveRoundId(latestRound.id);
    setActiveGroupId(latestRound.groups[0]?.id);
    setNextRoundGroupSize(3);
  };

  const selectCarouselTarget = (target) => {
    const nextTournament = competitions[target.categoryId];

    setActiveCategory(target.categoryId);
    setTeamCount(String(nextTournament.teams.length));
    setGroupSize(
      Math.min(5, Math.max(2, nextTournament.rounds[0]?.groups[0]?.teams.length ?? 3)),
    );
    setActiveRoundId(target.roundId);
    setActiveGroupId(target.groupId);
    setNextRoundGroupSize(3);
  };

  const scrollToStages = () => {
    window.requestAnimationFrame(() => {
      stagesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const scrollToWorkspace = () => {
    window.requestAnimationFrame(() => {
      workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const quickSelectCategory = (categoryId) => {
    selectCategory(categoryId);
    scrollToWorkspace();
  };

  const quickSelectGroup = (groupId) => {
    setActiveGroupId(groupId);
    scrollToWorkspace();
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await scoringPageRef.current?.requestFullscreen?.();
    } catch {
      // Ignore unsupported or denied fullscreen requests.
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (isEditMode) setIsCarouselActive(false);
  }, [isEditMode]);

  useEffect(() => {
    if (!isCarouselActive || isEditMode || carouselTargets.length < 2) return undefined;

    const intervalId = window.setInterval(() => {
      const currentIndex = activeCarouselIndex >= 0 ? activeCarouselIndex : 0;
      const nextTarget = carouselTargets[(currentIndex + 1) % carouselTargets.length];
      selectCarouselTarget(nextTarget);
      scrollToWorkspace();
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [activeCarouselIndex, carouselTargets, isCarouselActive, isEditMode]);

  useEffect(() => {
    const handleScroll = () => {
      const workspaceTop = workspaceRef.current?.getBoundingClientRect().top ?? Infinity;
      setShowQuickNav(workspaceTop < 180);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeCategory]);

  const teamName = (teamId) => tournament.teams.find((team) => team.id === teamId)?.name ?? "";

  return (
    <section className="scoring-page" ref={scoringPageRef}>
      <div className="scoring-hero">
        <div>
          <p className="eyebrow"><span /> TOURNAMENT SCORING</p>
          <h1>比賽<br /><em>計分台</em></h1>
          <p>
            建立 2–60 隊賽事，自動安排小組循環對戰。輸入每場比分後，
            系統會依預賽排名規則即時計算排名。
          </p>
        </div>
        <aside className="scoring-rule-card">
          <span>預賽排名規則</span>
          <ol>
            <li><strong>勝場</strong><small>勝場較多者優先</small></li>
            <li><strong>比數分差</strong><small>總得分 − 總失分</small></li>
            <li><strong>相關隊伍勝負</strong><small>仍並列時，比較相關隊伍互戰勝負</small></li>
            <li><strong>相關隊伍總失分</strong><small>總失分較少者優先</small></li>
            <li><strong>抽籤</strong><small>以上仍相同時，以抽籤決定名次</small></li>
          </ol>
        </aside>
      </div>

      <div className="category-section">
        <div className="category-heading">
          <span>TOURNAMENT CATEGORY</span>
          <div>
            <h2>選擇比賽項目</h2>
            <p>男雙、女雙與混雙各自擁有獨立的隊伍、賽程、比分與名次。</p>
          </div>
        </div>
        <div className="category-tabs">
          {CATEGORIES.map((item, index) => (
            <button
              type="button"
              className={item.id === activeCategory ? "active" : ""}
              onClick={() => selectCategory(item.id)}
              key={item.id}
            >
              <span>0{index + 1}</span>
              <strong>{item.name}</strong>
              <small>{item.englishName}</small>
              <b>{competitions[item.id].teams.length} 隊</b>
            </button>
          ))}
        </div>
      </div>

      <div className={`scoring-mode-panel${isEditMode ? " editing" : ""}`}>
        <div>
          <span>{isEditMode ? "EDIT MODE" : "VIEW MODE"}</span>
          <h2>{isEditMode ? "編輯模式已開啟" : "目前為觀看模式"}</h2>
          <p>
            {isEditMode
              ? "可輸入比分、修改隊伍、指定場地、清除比分與建立下一輪。操作完成後建議退出編輯模式。"
              : "觀看模式已簡化為現場展示；可直接進入比賽階段、放大全螢幕，或啟動輪播自動切換場次。"}
          </p>
          <div className="mode-meta-row">
            <strong>工作人員 PIN：{EDIT_MODE_PIN}</strong>
            <small>前端防誤觸機制，尚不等同後端帳號權限。</small>
          </div>
        </div>
        <div className="mode-action-grid">
          <button type="button" onClick={scrollToStages}>跳到比賽階段</button>
          <button type="button" onClick={toggleFullscreen}>
            {isFullscreen ? "離開全螢幕" : "放大全螢幕"}
          </button>
          <button
            type="button"
            className={isCarouselActive ? "active" : ""}
            onClick={() => {
              setIsCarouselActive((current) => !current);
              scrollToWorkspace();
            }}
            disabled={isEditMode || carouselTargets.length < 2}
          >
            {isCarouselActive ? "停止輪播" : "開始輪播"}
          </button>
          <button
            type="button"
            className="mode-edit-button"
            onClick={() => setIsEditMode(true)}
            disabled={isEditMode}
          >
            {isEditMode ? "編輯模式中" : "進入編輯模式"}
          </button>
          {isEditMode && (
            <button type="button" className="mode-exit-button" onClick={exitEditMode}>
              退出編輯模式
            </button>
          )}
        </div>
      </div>

      {isEditMode && (
        <div className="tournament-setup">
          <div className="setup-heading">
            <div>
              <span>STEP 01・{category.englishName}</span>
              <h2>建立{category.name}比賽</h2>
            </div>
            <p>系統會平均分配隊伍，並產生同組內每兩隊交手一次的賽程。</p>
          </div>
          <div className="setup-controls">
            <label>
              <span>參賽隊伍總數</span>
              <input
                type="number"
                min="1"
                max="60"
                inputMode="numeric"
                pattern="[0-9]*"
                value={teamCount}
                disabled={!isEditMode}
                onChange={handleTeamCountChange}
                onBlur={() => {
                  if (isEditMode && (teamCount === "" || normalizedTeamCount < 1)) setTeamCount("1");
                }}
              />
              <small>可輸入 1–60 隊</small>
              {hasSingleTeam && (
                <span className="team-count-warning" role="alert">
                  目前僅輸入一隊
                </span>
              )}
            </label>
            <label>
              <span>每組隊伍數</span>
              <select
                value={groupSize}
                disabled={!isEditMode}
                onChange={(event) => setGroupSize(Number(event.target.value))}
              >
                {[2, 3, 4, 5].map((size) => (
                  <option value={size} key={size}>{size} 隊</option>
                ))}
              </select>
              <small>可選 2–5 隊</small>
            </label>
            <button
              type="button"
              className="generate-button"
              onClick={handleGenerate}
              disabled={!isEditMode || !canGenerate}
            >
              產生分組與賽程 <span>↗</span>
            </button>
          </div>
          <div className="group-plan-preview" aria-live="polite">
            <div>
              <span>預計分組</span>
              <strong>{groupPlan.groupCount} 組</strong>
            </div>
            <div>
              <span>隊伍分配</span>
              <strong>{groupPlan.distribution}</strong>
            </div>
            <div>
              <span>小組賽總場次</span>
              <strong>{groupPlan.matchCount} 場</strong>
            </div>
          </div>
        </div>
      )}

      <div className="round-navigation-wrap" ref={stagesRef}>
        <div className="round-navigation-heading">
          <span>TOURNAMENT STAGES</span>
          <strong>{category.name}比賽階段</strong>
        </div>
        <div className="round-tabs">
          {tournament.rounds.map((round) => {
            const winners = winnersForRound(round);
            const complete = winners.length === round.groups.length;
            return (
              <button
                type="button"
                className={round.id === activeRound.id ? "active" : ""}
                onClick={() => selectRound(round)}
                key={round.id}
              >
                <span>{round.name}</span>
                <small>{round.groups.length} 組・{complete ? "已完賽" : "進行中"}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div className="tournament-workspace" ref={workspaceRef}>
        <div className="group-sidebar">
          <div className="workspace-title">
            <span>{activeRound.name.toUpperCase()}</span>
            <h2>選擇組別</h2>
          </div>
          <div className="group-tabs">
            {activeRound.groups.map((group) => {
              const groupMatches = activeRound.matches.filter((match) => match.groupId === group.id);
              const done = groupMatches.filter(isCompleted).length;
              return (
                <button
                  type="button"
                  className={group.id === activeGroup?.id ? "active" : ""}
                  onClick={() => setActiveGroupId(group.id)}
                  key={group.id}
                >
                  <span>{group.name}</span>
                  <small>{group.teams.length} 隊・{done}/{groupMatches.length} 場</small>
                </button>
              );
            })}
          </div>
          {isEditMode && (
            <button
              type="button"
              className="clear-button"
              onClick={clearScores}
              disabled={!canEditActiveRound}
            >
              {roundLocked ? "此輪已鎖定" : "清除此輪比分"}
            </button>
          )}
        </div>

        {activeGroup && (
          <div className="group-panel">
            <div className="group-panel-header">
              <div>
                <span>{activeRound.name}・{activeGroup.name}</span>
                <h2>隊伍與賽程</h2>
              </div>
              <div className={`progress-pill${groupComplete ? " complete" : ""}`}>
                {groupComplete ? "本組已完賽" : `${completedCount} / ${activeMatches.length} 場完成`}
              </div>
            </div>

            <div className="team-name-grid">
              {activeGroup.teams.map((team, index) => (
                <label key={team.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <input
                    value={team.name}
                    disabled={!canEditActiveRound}
                    aria-label={`${activeGroup.name}第 ${index + 1} 隊名稱`}
                    onChange={(event) => handleTeamName(team.id, event.target.value)}
                  />
                </label>
              ))}
            </div>

            <div className="score-section">
              <div className="subsection-heading">
                <h3>{isEditMode ? "比分輸入" : "比分檢視"}</h3>
                <small>
                  {isEditMode
                    ? "比分不可相同；平手場次不列入排名"
                    : "觀看模式已鎖定輸入欄位"}
                </small>
              </div>
              <div className="match-list">
                {activeMatches.map((match, index) => {
                  const tied =
                    match.homeScore !== "" &&
                    match.awayScore !== "" &&
                    Number(match.homeScore) === Number(match.awayScore);
                  return (
                    <div className={`match-row${tied ? " tied" : ""}`} key={match.id}>
                      <span className="match-number">MATCH {String(index + 1).padStart(2, "0")}</span>
                      <strong>{teamName(match.homeId)}</strong>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={match.homeScore}
                        disabled={!canEditActiveRound}
                        aria-label={`${teamName(match.homeId)}得分`}
                        onChange={(event) => handleScore(match.id, "homeScore", event.target.value)}
                      />
                      <b>:</b>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={match.awayScore}
                        disabled={!canEditActiveRound}
                        aria-label={`${teamName(match.awayId)}得分`}
                        onChange={(event) => handleScore(match.id, "awayScore", event.target.value)}
                      />
                      <strong>{teamName(match.awayId)}</strong>
                      <label className="venue-select">
                        <span>場地</span>
                        <select
                          value={match.venue ?? ""}
                          disabled={!canEditActiveRound}
                          aria-label={`${teamName(match.homeId)}對${teamName(match.awayId)}比賽場地`}
                          onChange={(event) => handleVenue(match.id, event.target.value)}
                        >
                          <option value="">未指定</option>
                          {["甲", "乙", "丙", "丁"].map((venue) => (
                            <option value={venue} key={venue}>場地 {venue}</option>
                          ))}
                        </select>
                      </label>
                      <span className="match-status">{tied ? "請決勝負" : isCompleted(match) ? "完成" : "待輸入"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="standings-section">
              <div className="subsection-heading">
                <h3>即時排名</h3>
                <small className="standings-heading-note">
                  預賽規則 <sup>＊</sup>
                </small>
              </div>
              <div className="standings-table-wrap">
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>排名</th>
                      <th>隊伍</th>
                      <th>賽</th>
                      <th>勝</th>
                      <th>敗</th>
                      <th>總得分</th>
                      <th>總失分</th>
                      <th>總分差 <sup>＊</sup></th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team, index) => (
                      <tr className={index === 0 && groupComplete ? "winner" : ""} key={team.id}>
                        <td><span className="rank-number">{index + 1}</span></td>
                        <td>
                          <strong>{team.name || "未命名隊伍"}</strong>
                          {index === 0 && groupComplete && (
                            <small>{champion ? "冠軍" : "晉級"}</small>
                          )}
                          {team.needsDraw && (
                            <small className="draw-needed">需抽籤</small>
                          )}
                        </td>
                        <td>{team.played}</td>
                        <td>{team.wins}</td>
                        <td>{team.losses}</td>
                        <td>{team.scored}</td>
                        <td>{team.conceded}</td>
                        <td className={team.difference > 0 ? "positive" : team.difference < 0 ? "negative" : ""}>
                          {team.difference > 0 ? "+" : ""}{team.difference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="standings-formula-note">
                <sup>＊</sup> 排名依序比較：勝場 → 總分差 → 相關隊伍勝負 → 相關隊伍總失分；仍相同時需抽籤。
                總分差 = 總得分 − 總失分
              </p>
            </div>

            {isLatestRound && roundComplete && (champion || isEditMode) && (
              <div className="round-advance-panel">
                {champion ? (
                  <div className="champion-result">
                    <span>TOURNAMENT WINNERS</span>
                    <div className="podium-results">
                      <div className="podium-place champion">
                        <small>冠軍</small>
                        <strong>{finalStandings[0]?.name ?? "未產生"}</strong>
                      </div>
                      <div className="podium-place runner-up">
                        <small>亞軍</small>
                        <strong>{finalStandings[1]?.name ?? "未產生"}</strong>
                      </div>
                      <div className="podium-place third-place">
                        <small>季軍</small>
                        <strong>{finalStandings[2]?.name ?? "未產生"}</strong>
                      </div>
                    </div>
                    <small>最終名次依預賽排名規則排序；仍相同時需抽籤。</small>
                  </div>
                ) : (
                  <>
                    <div className="advance-copy">
                      <span>{activeRound.name}完成</span>
                      <h3>建立第 {activeRound.number + 1} 輪</h3>
                      <p>
                        已產生 {roundWinners.length} 支晉級隊伍：
                        {roundWinners.map((winner) => winner.name).join("、")}
                      </p>
                    </div>
                    <label className="advance-group-size">
                      <span>下一輪每組隊伍數</span>
                      <select
                        value={Math.min(nextRoundGroupSize, Math.min(5, roundWinners.length))}
                        disabled={!isEditMode}
                        onChange={(event) => setNextRoundGroupSize(Number(event.target.value))}
                      >
                        {Array.from(
                          { length: Math.min(5, roundWinners.length) - 1 },
                          (_, index) => index + 2,
                        ).map((size) => (
                          <option value={size} key={size}>{size} 隊</option>
                        ))}
                      </select>
                    </label>
                    <button type="button" onClick={createNextRound} disabled={!isEditMode}>
                      {isEditMode ? "晉級並建立下一輪" : "觀看模式不可建立下一輪"} <span>↗</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`schedule-quick-nav${showQuickNav ? " show" : ""}`}>
        <div className="quick-nav-current">
          <span>目前位置</span>
          <strong>{category.name}・{activeGroup?.name}</strong>
        </div>
        <div className="quick-category-buttons" aria-label="快速切換比賽項目">
          {CATEGORIES.map((item) => (
            <button
              type="button"
              className={item.id === activeCategory ? "active" : ""}
              aria-pressed={item.id === activeCategory}
              onClick={() => quickSelectCategory(item.id)}
              key={item.id}
            >
              {item.name}
            </button>
          ))}
        </div>
        <label className="quick-group-select">
          <span>組別</span>
          <select
            value={activeGroup?.id ?? ""}
            onChange={(event) => quickSelectGroup(event.target.value)}
          >
            {activeRound.groups.map((group) => (
              <option value={group.id} key={group.id}>{group.name}</option>
            ))}
          </select>
        </label>
        <button type="button" className="quick-nav-top" onClick={scrollToWorkspace}>
          回到賽程 ↑
        </button>
      </div>
    </section>
  );
}
