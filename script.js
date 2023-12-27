var setTime = 0;
var display = document.querySelector("#time");
var duration = 02 * 60;
var strtTime = duration;
var totalEntries = 0;
var incorrectEntries = 0;
let startTime;
var endTime;
let GWPM;
let NWPM;
let timetaken;
var xValues = [];
var yValues = [];
var maxY = 0;

var stats = {
  GWPM: 0,
  NWPM: 0,
  timetaken: 0,
  incorrectEntries: 0,
  accuracy: 0,
};

// Get RandomQuotes, split them and create spans for the same
async function GetRandomQuotes() {
  var mainWord = "";
  for (var i = 0; i < 1; i++) {
    var randomquote = await GenerateRandomQuotes();
    mainWord += randomquote + " ";
  }
  mainWord += await GenerateRandomQuotes();

  SplitRandomQuote(mainWord);
}

function GetWords(words) {
  let mainWord = "";
  for (var i = 0; i < words.length - 1; i++) {
    mainWord += words[i] + " ";
  }
  mainWord += words[i];
  SplitRandomQuote(mainWord);
}

function GenerateRandomQuotes() {
  return fetch("https://api.quotable.io/random")
    .then((response) => response.json())
    .then((data) => data.content);

  // fetch("https://random-word-api.herokuapp.com/word?number=40")
  //   .then((response) => response.json())
  //   .then((data) => {
  //     GetWords(data);
  //   })
  //   .catch((error) => {
  //     console.error("Error fetching data:", error);
  //   });
}

function SplitRandomQuote(str) {
  const element = document.getElementById("quoteContainer");
  element.innerHTML = "";
  const myArray = str.split("");
  for (var i = 0; i < myArray.length; i++) {
    var x = document.createElement("span");
    x.innerText = myArray[i];
    element.appendChild(x);
  }
}

function startTimer() {
  var timer = duration;

  var refreshIntervalId = setInterval(function () {
    if (timer < 0) {
      CalculateWPM();
      clearInterval(refreshIntervalId);
      displayModal();
      return;
    }
    if (setTime == 0) {
      timer = duration;
      display.textContent = duration;
      clearInterval(refreshIntervalId);
    } else {
      timer--;
      display.textContent = timer;
    }
  }, 1000);
}

function CheckTheSpeed(event) {
  if (event.inputType != "deleteContentBackward") {
    totalEntries += 1;
  }

  var spans = document.getElementsByTagName("span");
  var inputValue = document.getElementById("inputText").value;
  var inputValueArray = inputValue.split("");

  if (inputValueArray.length > spans.length + 2) {
    WarningModal();
    return;
  }

  for (var i = 0; i < spans.length; i++) {
    if (i + 1 > inputValueArray.length) {
      spans[i].classList.remove("CorrectWord");
      spans[i].classList.remove("InCorrectWord");
      break;
    }

    if (spans[i].innerHTML === inputValueArray[i]) {
      spans[i].classList.add("CorrectWord");
      spans[i].classList.remove("InCorrectWord");
    } else if (spans[i].innerHTML != inputValueArray[i]) {
      if (i == inputValueArray.length - 1) {
        incorrectEntries += 1;
      }
      spans[i].classList.remove("CorrectWord");
      spans[i].classList.add("InCorrectWord");
    }
    if (i == spans.length - 2) {
      CalculateWPM();
      displayModal();
      break;
    }
  }
  CalculateWPM();
}

function CalculateWPM() {
  endTime = new Date();
  dif = endTime - startTime;
  timetaken = dif / (1000 * 60);
  let GWPM = Math.floor(totalEntries / 5 / timetaken);

  var NWPM = Math.floor((totalEntries - incorrectEntries) / 5 / timetaken);

  stats["NWPM"] = Math.abs(NWPM);
  stats["timetaken"] = dif / 1000;
  stats["accuracy"] = ((totalEntries - incorrectEntries) / totalEntries) * 100;
  stats["incorrectEntries"] = incorrectEntries;
  stats["GWPM"] = Math.floor(GWPM);

  let time = display.textContent;
  let timDif = strtTime - time;

  if ((strtTime - time) % 4 == 0 && strtTime - time != 0) {
    totlen = xValues.length;
    if (strtTime - time != xValues[totlen - 1] && totlen >= 0) {
      xValues.push(timDif);
      yValues.push(Math.floor(NWPM));
      if (Math.floor(NWPM) > maxY) {
        maxY = Math.floor(NWPM) + (20 - (Math.floor(NWPM) % 10));
      }
    }
  }
}

function CalculateSpeed(event) {
  if (setTime == 0) {
    setTime = 1;
    startTimer();
    startTime = new Date();
  }
  CheckTheSpeed(event);
}

window.onload = function () {
  GetRandomQuotes();
  const textarea = document.querySelector("textarea");
  textarea.addEventListener("input", CalculateSpeed);
  const closeModalBtn = document.getElementById("closeModal");
  closeModalBtn.addEventListener("click", closeModal);
};

function displayModal() {
  var NWPM = stats["NWPM"];

  document.getElementById("result_modal").style.display = "block";
  document.getElementById("inputText").disabled = true;

  document.getElementById("wpm_display").innerHTML = Math.floor(stats["NWPM"]);
  document.getElementById("error_display").innerHTML =
    stats["incorrectEntries"];
  document.getElementById("percent_display").innerHTML = Math.floor(
    stats["accuracy"]
  );
  document.getElementById("time_display").innerHTML =
    Math.ceil(stats["timetaken"]) + "s";
  document.getElementById("raw_display").innerHTML = stats["GWPM"];

  if (NWPM < 20) {
    document.getElementById("skill_display").innerHTML = "Beginner";
  } else if (NWPM > 20 && NWPM < 40) {
    document.getElementById("skill_display").innerHTML = "Intemediate";
  } else if (NWPM > 40 && NWPM < 50) {
    document.getElementById("skill_display").innerHTML = "Average";
  } else if (NWPM > 50 && NWPM < 70) {
    document.getElementById("skill_display").innerHTML = "Pro";
  } else {
    document.getElementById("skill_display").innerHTML = "Typemaster";
  }

  new Chart("myChart", {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          fill: false,
          lineTension: 0,
          backgroundColor: "yellow",
          borderColor: "#2C2620",
          data: yValues,
        },
      ],
    },
    options: {
      legend: { display: false },
      scales: {
        yAxes: [
          {
            ticks: { min: 0, max: maxY },
            gridLines: {
              color: "blue", // Color of the y-axis grid lines
            },
            scaleLabel: {
              display: true,
              labelString: "words per minute", // Label for the x-axis
              fontColor: "black", // Color of the x-axis label
            },
          },
        ],
        xAxes: [
          {
            gridLines: {
              color: "green", // Color of the x-axis grid lines
            },
            scaleLabel: {
              display: true,
              labelString: "Time in Seconds", // Label for the x-axis
              fontColor: "black", // Color of the x-axis label
            },
          },
        ],
      },
    },
  });
}

function WarningModal() {
  var modal = document.getElementById("myModal");
  modal.style.display = "block";
  var span = document.getElementsByClassName("close")[0];
  span.onclick = function () {
    modal.style.display = "none";
  };
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

function hideWarningModal() {
  var modal = document.getElementById("myModal");
  modal.style.display = "none";
}

function closeModal() {
  GetRandomQuotes();
  document.getElementById("inputText").value = "";
  document.getElementById("result_modal").style.display = "none";
  document.getElementById("inputText").disabled = false;
  setTime = 0;
  incorrectEntries = 0;
  totalEntries = 0;
}
