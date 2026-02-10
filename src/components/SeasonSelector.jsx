import './SeasonSelector.css';

function SeasonSelector({ seasons, selectedSeason, onSeasonChange }) {
    return (
        <div className="season-selector">
            <select
                value={selectedSeason}
                onChange={(e) => onSeasonChange(Number(e.target.value))}
                className="season-select"
            >
                {seasons.map((season) => (
                    <option key={season.season_number} value={season.season_number}>
                        Temporada {season.season_number}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default SeasonSelector;
