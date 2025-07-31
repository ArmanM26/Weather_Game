import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders weather game title", () => {
  render(<App />);
  const titleElement = screen.getByText(/Weather Temperature Game/i);
  expect(titleElement).toBeInTheDocument();
});

test("renders guess input field", () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/Enter temperature in °C/i);
  expect(inputElement).toBeInTheDocument();
});

test("renders submit button", () => {
  render(<App />);
  const buttonElement = screen.getByText(/Submit/i);
  expect(buttonElement).toBeInTheDocument();
});
