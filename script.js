// script.js
// This is the file where Copilot suggestions will do most of the work.
// Start by writing a comment describing a function you want, then let
// Copilot suggest the implementation.
// Returns true if the input string is a palindrome
function isPalindrome(value) {
  const reversed = reverseString(value);
  return value === reversed;
}

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

function checkPalindrome() {
  const raw = document.getElementById('palindromeInput').value;
  // normalise: lowercase and strip non-alphanumeric characters before comparing
  const normalised = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
  const result = isPalindrome(normalised);
  const output = document.getElementById('palindromeOutput');
  if (raw === '') {
    output.textContent = 'Please enter a value.';
  } else {
    output.textContent = `"${raw}" is ${result ? '' : 'not '}a palindrome.`;
  }
}

document.getElementById('palindromeBtn').addEventListener('click', checkPalindrome);
