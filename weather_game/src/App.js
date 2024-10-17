import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "https://api.openweathermap.org/data/2.5/weather?q=";
const API_KEY = "fd48bdf8a8b87b3c140f17625f4e2d57";

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

const WeatherGuessGame = () => {
  const [currentCity, setCurrentCity] = useState("");
  const [temperature, setTemperature] = useState(null);
  const [guess, setGuess] = useState("");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [cityHistory, setCityHistory] = useState([]);

  const fetchTemperature = async (city) => {
    try {
      const response = await fetch(
        `${API_URL}${city}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      setTemperature(data.main.temp);
      setCurrentCity(city);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const getRandomCity = () => {
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    fetchTemperature(randomCity);
  };

  const checkGuess = () => {
    if (!guess) return;

    const guessNumber = parseFloat(guess);
    if (!isNaN(guessNumber) && temperature !== null) {
      const difference = Math.abs(guessNumber - temperature);
      let feedbackMessage = `The temperature in ${currentCity} was ${temperature} °C. `;
      if (difference <= 1) {
        feedbackMessage += "You guessed it exactly!";
        setScore(score + 5);
      } else if (difference <= 5) {
        feedbackMessage += `Very close! The difference is ${difference.toFixed(
          1
        )} °C.`;
        setScore(score + 3);
      } else {
        feedbackMessage += `The difference was ${difference.toFixed(1)} °C.`;
      }
      setFeedback(feedbackMessage);

      // Save city guess history
      setCityHistory((prevHistory) => [
        ...prevHistory,
        { city: currentCity, guessed: guessNumber, actual: temperature },
      ]);

      if (round < 5) {
        setRound(round + 1);
        setGuess("");
        getRandomCity();
      } else {
        setGameOver(true);
      }
    }
  };

  useEffect(() => {
    getRandomCity();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    checkGuess();
  };

  return (
    <div className="container">
      <h1>Guess the Temperature Game</h1>
      {!gameOver ? (
        <div>
          <p>Round {round} of 5</p>
          <p>
            Guess the temperature in: <strong>{currentCity}</strong>
          </p>

          <form onSubmit={handleSubmit} className="form-container">
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter your guess"
            />
            <button type="submit">Submit</button>
          </form>

          {feedback && <p className="feedback">{feedback}</p>}
          <div className="city-history">
            <h3>Guessed Cities:</h3>
            {cityHistory.map((entry, index) => (
              <div key={index} className="city-entry">
                <span>{entry.city}:</span> Your guess: {entry.guessed} °C,
                Actual: {entry.actual} °C
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2>Game Over!</h2>
          <p>Your final score: {score} out of 25 possible.</p>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default WeatherGuessGame;
