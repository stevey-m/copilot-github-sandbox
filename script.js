// script.js
// This is the file where Copilot suggestions will do most of the work.
// Start by writing a comment describing a function you want, then let
// Copilot suggest the implementation.

/**
 * Example starter function — replace or extend with Copilot's help.
 * Reverses the input string.
 * @param {string} value
 * @returns {string}
 */
function reverseString(value) {
  return value.split('').reverse().join('');
}

/**
 * Wires up the demo UI. Calls reverseString() on the input value
 * and writes the result to the output element.
 */
function runDemo() {
  const input = document.getElementById('inputValue').value;
  const output = document.getElementById('output');
  output.textContent = reverseString(input);
}

document.getElementById('runBtn').addEventListener('click', runDemo);
