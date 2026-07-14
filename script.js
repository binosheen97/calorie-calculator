let currentUnit = 'metric';
let currentGender = 'male';
let currentGoal = 'maintain';

function switchUnit(unit) {
    currentUnit = unit;
    document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-unit="${unit}"]`).classList.add('active');
    document.querySelectorAll('.metric-field').forEach(f => f.style.display = unit === 'metric' ? 'block' : 'none');
    document.querySelectorAll('.imperial-field').forEach(f => f.style.display = unit === 'imperial' ? 'block' : 'none');
    document.getElementById('weight-unit').textContent = unit === 'metric' ? 'kg' : 'lbs';
    clearError();
}

function setGender(gender) {
    currentGender = gender;
    document.getElementById('btn-male').classList.toggle('active', gender === 'male');
    document.getElementById('btn-female').classList.toggle('active', gender === 'female');
}

function setGoal(goal) {
    currentGoal = goal;
    ['lose', 'maintain', 'gain'].forEach(g => {
        document.getElementById('goal-' + g).classList.toggle('active', g === goal);
    });
}

function calculate() {
    clearError();

    const age = parseFloat(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const activityFactor = parseFloat(document.getElementById('activity').value);

    if (!age || age < 1 || age > 120) { showError('Please enter a valid age (1-120).'); return; }
    if (!weight || weight <= 0) { showError('Please enter a valid weight.'); return; }

    // Get height in cm
    let heightCm;
    if (currentUnit === 'metric') {
        heightCm = parseFloat(document.getElementById('height-cm').value);
        if (!heightCm || heightCm <= 0) { showError('Please enter a valid height.'); return; }
    } else {
        const ft = parseFloat(document.getElementById('height-ft').value) || 0;
        const inches = parseFloat(document.getElementById('height-in').value) || 0;
        if (ft <= 0 && inches <= 0) { showError('Please enter a valid height.'); return; }
        heightCm = (ft * 12 + inches) * 2.54;
    }

    // Convert weight to kg if imperial
    const weightKg = currentUnit === 'metric' ? weight : weight * 0.453592;

    // Mifflin-St Jeor equation
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr += currentGender === 'male' ? 5 : -161;

    const tdee = bmr * activityFactor;

    // Goal calories
    const loseAggressive = tdee - 1000;
    const loseMild = tdee - 500;
    const maintain = tdee;
    const gainMild = tdee + 300;
    const gainAggressive = tdee + 500;

    // Set target based on goal
    let targetCalories;
    if (currentGoal === 'lose') targetCalories = loseMild;
    else if (currentGoal === 'maintain') targetCalories = maintain;
    else targetCalories = gainMild;

    // Macros based on goal
    let macroRatios;
    if (currentGoal === 'lose') {
        macroRatios = { protein: 0.35, carbs: 0.35, fat: 0.30 };
    } else if (currentGoal === 'gain') {
        macroRatios = { protein: 0.30, carbs: 0.45, fat: 0.25 };
    } else {
        macroRatios = { protein: 0.25, carbs: 0.50, fat: 0.25 };
    }

    const proteinCal = targetCalories * macroRatios.protein;
    const carbsCal   = targetCalories * macroRatios.carbs;
    const fatCal     = targetCalories * macroRatios.fat;

    const proteinG = proteinCal / 4;
    const carbsG   = carbsCal / 4;
    const fatG     = fatCal / 9;

    displayResults(bmr, tdee, targetCalories, loseMild, loseAggressive, maintain, gainMild, gainAggressive,
        proteinG, carbsG, fatG, macroRatios);
}

function displayResults(bmr, tdee, target, loseMild, loseAggressive, maintain, gainMild, gainAggressive,
    proteinG, carbsG, fatG, macros) {

    const goalColors = {
        lose: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        maintain: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        gain: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    };

    const goalLabels = {
        lose: 'Calories for Weight Loss',
        maintain: 'Calories for Maintenance',
        gain: 'Calories for Weight Gain'
    };

    const card = document.getElementById('results-card');
    card.style.justifyContent = 'flex-start';
    card.innerHTML = `
        <div style="animation: fadeIn 0.5s ease; width: 100%;">
            <div class="calorie-hero" style="background: ${goalColors[currentGoal]}">
                <div class="hero-label">${goalLabels[currentGoal]}</div>
                <div class="hero-value">${Math.round(target)}</div>
                <div class="hero-sub">calories per day</div>
            </div>

            <div class="calorie-goals">
                <div class="goal-box ${currentGoal === 'lose' ? 'active-goal' : ''}">
                    <div class="goal-box-icon">⬇️</div>
                    <div class="goal-box-label">Mild Loss</div>
                    <div class="goal-box-value">${Math.round(loseMild)}</div>
                    <div class="goal-box-sub">−0.5 kg/week</div>
                </div>
                <div class="goal-box ${currentGoal === 'maintain' ? 'active-goal' : ''}">
                    <div class="goal-box-icon">⚖️</div>
                    <div class="goal-box-label">Maintain</div>
                    <div class="goal-box-value">${Math.round(maintain)}</div>
                    <div class="goal-box-sub">current weight</div>
                </div>
                <div class="goal-box ${currentGoal === 'gain' ? 'active-goal' : ''}">
                    <div class="goal-box-icon">⬆️</div>
                    <div class="goal-box-label">Mild Gain</div>
                    <div class="goal-box-value">${Math.round(gainMild)}</div>
                    <div class="goal-box-sub">+0.3 kg/week</div>
                </div>
            </div>

            <div class="stats-row">
                <div class="stat-box">
                    <div class="stat-label">BMR (at rest)</div>
                    <div class="stat-value">${Math.round(bmr)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">TDEE (with activity)</div>
                    <div class="stat-value">${Math.round(tdee)}</div>
                </div>
            </div>

            <div class="macros-section">
                <div class="macros-title">Daily Macronutrients</div>
                <div class="macro-bar-item">
                    <div class="macro-bar-header">
                        <span>🥩 Protein</span>
                        <span>${Math.round(proteinG)}g &nbsp;(${Math.round(macros.protein * 100)}%)</span>
                    </div>
                    <div class="macro-bar-track">
                        <div class="macro-bar-fill" style="width:${macros.protein * 100}%; background: #667eea;"></div>
                    </div>
                </div>
                <div class="macro-bar-item">
                    <div class="macro-bar-header">
                        <span>🌾 Carbohydrates</span>
                        <span>${Math.round(carbsG)}g &nbsp;(${Math.round(macros.carbs * 100)}%)</span>
                    </div>
                    <div class="macro-bar-track">
                        <div class="macro-bar-fill" style="width:${macros.carbs * 100}%; background: #43e97b;"></div>
                    </div>
                </div>
                <div class="macro-bar-item">
                    <div class="macro-bar-header">
                        <span>🥑 Fat</span>
                        <span>${Math.round(fatG)}g &nbsp;(${Math.round(macros.fat * 100)}%)</span>
                    </div>
                    <div class="macro-bar-track">
                        <div class="macro-bar-fill" style="width:${macros.fat * 100}%; background: #f5576c;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showError(msg) {
    const el = document.getElementById('error-msg');
    el.textContent = msg;
    el.classList.add('show');
}

function clearError() {
    document.getElementById('error-msg').classList.remove('show');
}

// Enter key support
document.addEventListener('keypress', e => { if (e.key === 'Enter') calculate(); });
