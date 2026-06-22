import { useMemo, useState } from "react";

const STORAGE_KEY = "picklechill-tournament-v1";

function makeTeams(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `team-${index + 1}`,
    name: `隊伍 ${String(index + 1).padStart(2, "0")}`,
  }));
}

function distributeTeams(teams, preferredSize) {
  let groupCount = Math.ceil(teams.length / preferredSize);
  while (groupCount > 1 && Math.floor(teams.length / groupCount) < 2) groupCount -= 1;
  const baseSize = Math.floor(teams.length / groupCount);
  const largerGroupCount = teams.length % groupCount;
  let teamIndex = 0;

  return Array.from({ length: groupCount }, (_, index) => {
    const size = baseSize + (index < largerGroupCount ? 1 : 0);
    const group = {
      id: `group-${index + 1}`,
      name: `第 ${String.fromCharCode(65 + index)} 組`,
      teams: teams.slice(teamIndex, teamIndex + size),
    };
    teamIndex += size;
    return group;
  });
}

function getGroupPlan(teamCount, preferredSize) {
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

function makeMatches(groups) {
  return groups.flatMap((group) => {
    const matches = [];

    for (let home = 0; home < group.teams.length; home += 1) {
      for (let away = home + 1; away < group.teams.length; away += 1) {
        matches.push({
          id: `${group.id}-${group.teams[home].id}-${group.teams[away].id}`,
          groupId: group.id,
          homeId: group.teams[home].id,
          awayId: group.teams[away].id,
          homeScore: "",
          awayScore: "",
        });
      }
    }

    return matches;
  });
}

function createTournament(teamCount, groupSize) {
  const teams = makeTeams(teamCount);
  const groups = distributeTeams(teams, groupSize);

  return { teams, groups, matches: makeMatches(groups) };
}

function readSavedTournament() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.teams && saved?.groups && saved?.matches) return saved;
  } catch {
    // Ignore invalid local data and start with a clean tournament.
  }

  return createTournament(3, 3);
}

function isCompleted(match) {
  return (
    match.homeScore !== "" &&
    match.awayScore !== "" &&
    Number(match.homeScore) !== Number(match.awayScore)
  );
}

function standingsFor(group, matches) {
  const rows = group.teams.map((team) => ({
    ...team,
    played: 0,
    wins: 0,
    losses: 0,
    scored: 0,
    conceded: 0,
    difference: 0,
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

  return rows.sort(
    (a, b) =>
      b.wins - a.wins ||
      b.difference - a.difference ||
      b.scored - a.scored ||
      a.name.localeCompare(b.name, "zh-Hant"),
  );
}

export default function TournamentScoring() {
  const [tournament, setTournament] = useState(readSavedTournament);
  const [teamCount, setTeamCount] = useState(tournament.teams.length);
  const [groupSize, setGroupSize] = useState(
    Math.min(5, Math.max(2, tournament.groups[0]?.teams.length ?? 3)),
  );
  const [activeGroupId, setActiveGroupId] = useState(tournament.groups[0]?.id);
  const groupPlan = useMemo(
    () => getGroupPlan(teamCount, groupSize),
    [teamCount, groupSize],
  );

  const activeGroup =
    tournament.groups.find((group) => group.id === activeGroupId) ?? tournament.groups[0];
  const activeMatches = tournament.matches.filter((match) => match.groupId === activeGroup?.id);
  const standings = useMemo(
    () => (activeGroup ? standingsFor(activeGroup, tournament.matches) : []),
    [activeGroup, tournament.matches],
  );
  const completedCount = activeMatches.filter(isCompleted).length;
  const groupComplete = activeMatches.length > 0 && completedCount === activeMatches.length;

  const persist = (nextTournament) => {
    setTournament(nextTournament);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTournament));
  };

  const handleGenerate = () => {
    const nextTournament = createTournament(teamCount, groupSize);
    persist(nextTournament);
    setActiveGroupId(nextTournament.groups[0]?.id);
  };

  const handleTeamName = (teamId, name) => {
    const teams = tournament.teams.map((team) => (team.id === teamId ? { ...team, name } : team));
    const groups = tournament.groups.map((group) => ({
      ...group,
      teams: group.teams.map((team) => (team.id === teamId ? { ...team, name } : team)),
    }));
    persist({ ...tournament, teams, groups });
  };

  const handleScore = (matchId, field, value) => {
    const cleanValue = value === "" ? "" : Math.max(0, Number.parseInt(value, 10) || 0);
    const matches = tournament.matches.map((match) =>
      match.id === matchId ? { ...match, [field]: cleanValue } : match,
    );
    persist({ ...tournament, matches });
  };

  const clearScores = () => {
    const matches = tournament.matches.map((match) => ({
      ...match,
      homeScore: "",
      awayScore: "",
    }));
    persist({ ...tournament, matches });
  };

  const teamName = (teamId) => tournament.teams.find((team) => team.id === teamId)?.name ?? "";

  return (
    <section className="scoring-page">
      <div className="scoring-hero">
        <div>
          <p className="eyebrow"><span /> TOURNAMENT SCORING</p>
          <h1>比賽<br /><em>計分台</em></h1>
          <p>
            建立 2–40 隊賽事，自動安排小組循環對戰。輸入每場比分後，
            系統會依勝場與總分差即時計算排名。
          </p>
        </div>
        <aside className="scoring-rule-card">
          <span>排名規則</span>
          <ol>
            <li><strong>勝場數</strong><small>勝場較多者優先</small></li>
            <li><strong>總分差</strong><small>總得分 − 總失分</small></li>
            <li><strong>總得分</strong><small>仍同分時比較得分</small></li>
          </ol>
        </aside>
      </div>

      <div className="tournament-setup">
        <div className="setup-heading">
          <div>
            <span>STEP 01</span>
            <h2>建立比賽</h2>
          </div>
          <p>系統會平均分配隊伍，並產生同組內每兩隊交手一次的賽程。</p>
        </div>
        <div className="setup-controls">
          <label>
            <span>參賽隊伍總數</span>
            <input
              type="number"
              min="2"
              max="40"
              value={teamCount}
              onChange={(event) =>
                setTeamCount(Math.min(40, Math.max(2, Number(event.target.value) || 2)))
              }
            />
            <small>最多 40 隊</small>
          </label>
          <label>
            <span>每組隊伍數</span>
            <select value={groupSize} onChange={(event) => setGroupSize(Number(event.target.value))}>
              {[2, 3, 4, 5].map((size) => (
                <option value={size} key={size}>{size} 隊</option>
              ))}
            </select>
            <small>可選 2–5 隊</small>
          </label>
          <button type="button" className="generate-button" onClick={handleGenerate}>
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

      <div className="tournament-workspace">
        <div className="group-sidebar">
          <div className="workspace-title">
            <span>STEP 02</span>
            <h2>選擇組別</h2>
          </div>
          <div className="group-tabs">
            {tournament.groups.map((group) => {
              const groupMatches = tournament.matches.filter((match) => match.groupId === group.id);
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
          <button type="button" className="clear-button" onClick={clearScores}>清除全部比分</button>
        </div>

        {activeGroup && (
          <div className="group-panel">
            <div className="group-panel-header">
              <div>
                <span>{activeGroup.name}</span>
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
                    aria-label={`${activeGroup.name}第 ${index + 1} 隊名稱`}
                    onChange={(event) => handleTeamName(team.id, event.target.value)}
                  />
                </label>
              ))}
            </div>

            <div className="score-section">
              <div className="subsection-heading">
                <h3>比分輸入</h3>
                <small>比分不可相同；平手場次不列入排名</small>
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
                        aria-label={`${teamName(match.homeId)}得分`}
                        onChange={(event) => handleScore(match.id, "homeScore", event.target.value)}
                      />
                      <b>:</b>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={match.awayScore}
                        aria-label={`${teamName(match.awayId)}得分`}
                        onChange={(event) => handleScore(match.id, "awayScore", event.target.value)}
                      />
                      <strong>{teamName(match.awayId)}</strong>
                      <span className="match-status">{tied ? "請決勝負" : isCompleted(match) ? "完成" : "待輸入"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="standings-section">
              <div className="subsection-heading">
                <h3>即時排名</h3>
                <small>勝場相同時，以總分差高者優先</small>
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
                      <th>得分</th>
                      <th>失分</th>
                      <th>分差</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team, index) => (
                      <tr className={index === 0 && groupComplete ? "winner" : ""} key={team.id}>
                        <td><span className="rank-number">{index + 1}</span></td>
                        <td><strong>{team.name || "未命名隊伍"}</strong>{index === 0 && groupComplete && <small>晉級</small>}</td>
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
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
