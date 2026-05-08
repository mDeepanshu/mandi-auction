const hindiNumbers = {
  0: "शून्य",
  1: "एक",
  2: "दो",
  3: "तीन",
  4: "चार",
  5: "पांच",
  6: "छह",
  7: "सात",
  8: "आठ",
  9: "नौ",
  10: "दस",
  11: "ग्यारह",
  12: "बारह",
  13: "तेरह",
  14: "चौदह",
  15: "पंद्रह",
  16: "सोलह",
  17: "सत्रह",
  18: "अठारह",
  19: "उन्नीस",
  20: "बीस",
  30: "तीस",
  40: "चालीस",
  50: "पचास",
  60: "साठ",
  70: "सत्तर",
  80: "अस्सी",
  90: "नब्बे",
};


function numberToHindi(num) {
  if (num <= 20) return hindiNumbers[num];

  if (num < 100) {
    const tens = Math.floor(num / 10) * 10;
    const ones = num % 10;

    return ones
      ? `${hindiNumbers[tens]} ${hindiNumbers[ones]}`
      : hindiNumbers[tens];
  }

  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;

    return remainder
      ? `${hindiNumbers[hundreds]} सौ ${numberToHindi(
        remainder
      )}`
      : `${hindiNumbers[hundreds]} सौ`;
  }

  return num.toString();
}

export const speakCreditEntry = ({
  amount,
  vyapariId,
  vyapariName,
}) => {

  const synth = window.speechSynthesis;

  synth.cancel();

  // const text = `${numberToHindi(amount)} रुपये जमा हुए। आई डी नंबर ${numberToHindi(vyapariId)}`;
  const text =
    `व्यापारी ${vyapariName} जिनका, ` +
    `आई डी नंबर ${numberToHindi(vyapariId)}, ` +
    `के लिए ${numberToHindi(amount)} रुपये जमा हुए`;

  const utterance = new SpeechSynthesisUtterance(text);

  // Get all available voices
  const voices = synth.getVoices();
  // Find Hindi voice
  const hindiVoice = voices.find(
    (voice) =>
      voice.name === "Microsoft Kalpana - Hindi (India)"
  );

  if (hindiVoice) {
    utterance.voice = hindiVoice;
  }

  utterance.lang = "hi-IN";
  utterance.rate = 0.7;
  utterance.pitch = 1;

  synth.speak(utterance);
};