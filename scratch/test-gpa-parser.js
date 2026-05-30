// GPA parsing and flow test script
function simulateGpaState(initialGpa) {
  console.log(`\n--- Test Initial State: "${initialGpa}" ---`);
  
  // 1. Split logic inside Step2 render
  const val = initialGpa || "";
  const index = val.indexOf("/");
  let gpaNumeric, gpaScale;
  if (index !== -1) {
    gpaNumeric = val.slice(0, index).trim();
    gpaScale = val.slice(index).trim();
  } else {
    gpaNumeric = val.trim();
    gpaScale = "/4.0";
  }
  
  console.log(`  Split result: numeric="${gpaNumeric}", scale="${gpaScale}"`);

  // 2. Simulate typing numeric change
  const testTyping = (newNum) => {
    let numVal = newNum.replace(/\/.*/g, "").trim();
    const updatedGpa = `${numVal}${gpaScale}`;
    console.log(`  User types numeric "${newNum}" -> Result: "${updatedGpa}"`);
    return updatedGpa;
  };

  // 3. Simulate scale change
  const testScale = (newScale) => {
    const updatedGpa = `${gpaNumeric}${newScale}`;
    console.log(`  User selects scale "${newScale}" -> Result: "${updatedGpa}"`);
    return updatedGpa;
  };

  // 4. Simulate blur formatting
  const testBlur = (blurVal) => {
    const val = blurVal.trim().replace(/\/.*/g, "");
    let formatted = val.replace(",", ".");

    if (/^\d+$/.test(formatted)) {
      formatted = `${formatted}.0`;
    } else if (/^\d+\.$/.test(formatted)) {
      formatted = `${formatted}0`;
    } else if (/^\.\d+$/.test(formatted)) {
      formatted = `0${formatted}`;
    }

    const updatedGpa = `${formatted}${gpaScale}`;
    console.log(`  User blurs with "${blurVal}" -> Formatted: "${formatted}" -> Result: "${updatedGpa}"`);
    return updatedGpa;
  };

  testTyping("3.2");
  testScale("/10.0");
  testBlur("3");
}

simulateGpaState("3.0/4.0");
simulateGpaState("8.0/10.0");
simulateGpaState("3.8/5.0");
simulateGpaState(""); // Test default fallback
