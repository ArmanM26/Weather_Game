"use client";

import { useState, useEffect } from "react";
import "./App.css";

const cities = [
  "Yerevan",
  "London",
  "Tokyo",
  "New York",
  "Sydney",
  "Moscow",
  "Paris",
  "Berlin",
  "Rio de Janeiro",
  "Cairo",
  "Beijing",
];

// Mock weather data generator
const cityTemperatureRanges = {
  Yerevan: { min: -5, max: 35, season_offset: 0 },
  London: { min: 2, max: 25, season_offset: -3 },
  Tokyo: { min: 5, max: 35, season_offset: 2 },
  "New York": { min: -10, max: 30, season_offset: -2 },
  Sydney: { min: 8, max: 35, season_offset: 5 },
  Moscow: { min: -20, max: 25, season_offset: -5 },
  Paris: { min: 0, max: 28, season_offset: -2 },
  Berlin: { min: -5, max: 25, season_offset: -3 },
  "Rio de Janeiro": { min: 18, max: 35, season_offset: 8 },
  Cairo: { min: 10, max: 40, season_offset: 10 },
  Beijing: { min: -10, max: 35, season_offset: 0 },
};

function generateRealisticTemperature(city) {
  const cityData = cityTemperatureRanges[city];
  if (!cityData) {
    return Math.round(Math.random() * 30 + 5);
  }

  const { min, max, season_offset } = cityData;
  const currentMonth = new Date().getMonth();
  const seasonalVariation = Math.sin(((currentMonth - 3) * Math.PI) / 6) * 10;
  const randomVariation = (Math.random() - 0.5) * 10;
  const baseTemp = (min + max) / 2;
  const temperature =
    baseTemp + season_offset + seasonalVariation + randomVariation;

  return Math.round(Math.max(min - 5, Math.min(max + 5, temperature)));
}

const WeatherGuessGame = () => {
  const [currentCity, setCurrentCity] = useState("");
  const [temperature, setTemperature] = useState(null);
  const [guess, setGuess] = useState("");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [cityHistory, setCityHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTemperature = async (city) => {
    setLoading(true);
    setError("");

    try {
      // Simulate API delay
      await new Promise((resolve) =>
        setTimeout(resolve, 500 + Math.random() * 1000)
      );

      const temp = generateRealisticTemperature(city);
      setTemperature(temp);
      setCurrentCity(city);
    } catch (err) {
      setError("Unable to load weather data. Please try again.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRandomCity = () => {
    const availableCities = cities.filter(
      (city) => !cityHistory.some((history) => history.city === city)
    );
    const randomCity =
      availableCities.length > 0
        ? availableCities[Math.floor(Math.random() * availableCities.length)]
        : cities[Math.floor(Math.random() * cities.length)];

    fetchTemperature(randomCity);
  };

  const calculatePoints = (difference) => {
    if (difference <= 1) return 5;
    if (difference <= 3) return 4;
    if (difference <= 5) return 3;
    if (difference <= 10) return 2;
    if (difference <= 15) return 1;
    return 0;
  };

  const checkGuess = () => {
    if (!guess.trim() || temperature === null) return;

    const guessNumber = Number.parseFloat(guess);
    if (isNaN(guessNumber)) {
      setError("Please enter a valid number");
      return;
    }

    const difference = Math.abs(guessNumber - temperature);
    const points = calculatePoints(difference);

    let feedbackMessage = `The temperature in ${currentCity} was ${temperature}°C. `;

    if (difference <= 1) {
      feedbackMessage += "Perfect guess! 🎯";
    } else if (difference <= 3) {
      feedbackMessage += "Excellent! Very close! 🔥";
    } else if (difference <= 5) {
      feedbackMessage += "Great guess! 👍";
    } else if (difference <= 10) {
      feedbackMessage += "Not bad! 👌";
    } else {
      feedbackMessage += "Keep trying! 💪";
    }

    setFeedback(feedbackMessage);
    setScore((prevScore) => prevScore + points);

    const newGuess = {
      city: currentCity,
      guessed: guessNumber,
      actual: temperature,
      points,
    };

    setCityHistory((prev) => [...prev, newGuess]);

    if (round < 5) {
      setTimeout(() => {
        setRound((prev) => prev + 1);
        setGuess("");
        setFeedback("");
        getRandomCity();
      }, 3000);
    } else {
      setTimeout(() => {
        setGameOver(true);
      }, 3000);
    }
  };

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setGuess("");
    setFeedback("");
    setGameOver(false);
    setCityHistory([]);
    setError("");
    getRandomCity();
  };

  useEffect(() => {
    getRandomCity();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    checkGuess();
  };

  const getScoreColor = (score) => {
    if (score >= 20) return "score-excellent";
    if (score >= 15) return "score-good";
    return "score-needs-improvement";
  };

  const getPointsBadge = (points) => {
    if (points >= 4) return "badge-excellent";
    if (points >= 2) return "badge-good";
    return "badge-poor";
  };

  if (gameOver) {
    return (
      <div className="app">
        <div className="container game-over">
          <div className="trophy">🏆</div>
          <h1>Game Over!</h1>
          <p className="final-score">
            Your final score:{" "}
            <span className={getScoreColor(score)}>{score}</span> out of 25
            possible
          </p>

          <div className="results-section">
            <h3>Your Guesses:</h3>
            <div className="city-history">
              {cityHistory.map((entry, index) => (
                <div key={index} className="city-entry-detailed">
                  <div className="city-info">
                    <span className="city-name">📍 {entry.city}</span>
                    <div className="guess-details">
                      Guessed: {entry.guessed}°C | Actual: {entry.actual}°C
                    </div>
                  </div>
                  <span
                    className={`points-badge ${getPointsBadge(entry.points)}`}
                  >
                    {entry.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={resetGame} className="play-again-btn">
            🔄 Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <div className="thermometer-icon">🌡️</div>
          <h1>Weather Temperature Game</h1>
          <p className="subtitle">
            Guess the current temperature in different cities around the world!
          </p>
          <p className="demo-note">(Using simulated weather data)</p>
        </div>

        <div className="game-info">
          <div className="round-info">Round {round} of 5</div>
          <div className="score-info">
            Score: <span className={getScoreColor(score)}>{score}</span>
          </div>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(round - 1) * 20}%` }}
          ></div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="city-section">
          <p className="guess-prompt">Guess the temperature in:</p>
          <div className="current-city">
            <span className="location-icon">📍</span>
            <span className="city-name">
              {loading ? "Loading..." : currentCity}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="guess-form">
          <div className="input-group">
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter temperature in °C"
              disabled={loading || !!feedback}
              className="temperature-input"
            />
            <button
              type="submit"
              disabled={loading || !guess.trim() || !!feedback}
              className="submit-btn"
            >
              Submit
            </button>
          </div>
        </form>

        {feedback && (
          <div className="feedback-section">
            <p className="feedback-message">{feedback}</p>
            <p className="next-round-info">
              {round < 5
                ? "Next city loading..."
                : "Calculating final score..."}
            </p>
          </div>
        )}

        {cityHistory.length > 0 && (
          <div className="history-section">
            <h3>Previous Guesses:</h3>
            <div className="city-history">
              {cityHistory.map((entry, index) => (
                <div key={index} className="city-entry">
                  <span className="city-name">{entry.city}</span>
                  <div className="guess-info">
                    <span>Your: {entry.guessed}°C</span>
                    <span>Actual: {entry.actual}°C</span>
                    <span
                      className={`points-badge ${getPointsBadge(entry.points)}`}
                    >
                      +{entry.points}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherGuessGame;
