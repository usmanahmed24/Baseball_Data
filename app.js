// read excel file
document.addEventListener('DOMContentLoaded', function() {
    const fileUrl = 'BattedBallData.xlsx'; 
    let jsonData = [];
    
    // load the Excel file and read data
    async function loadExcelData() {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheet = workbook.Sheets[workbook.SheetNames[0]]; 
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // relevant data from all rows
        const launchAngles = [];
        const exitSpeeds = [];
        const hitDistances = [];
        const hangTimes = [];
        const playOutcomes = [];
        
        jsonData.forEach(row => {
            if (row.LAUNCH_ANGLE && row.EXIT_SPEED && row.HIT_DISTANCE && row.HANG_TIME) {
                launchAngles.push(row.LAUNCH_ANGLE);
                exitSpeeds.push(row.EXIT_SPEED);
                hitDistances.push(row.HIT_DISTANCE);
                hangTimes.push(row.HANG_TIME);
                playOutcomes.push(row.PLAY_OUTCOME);
            }
        });

        // use these arrays to create the charts
        createLaunchVsSpeedChart(launchAngles, exitSpeeds);
        createExitSpeedVsHitDistanceChart(exitSpeeds, hitDistances);
        createDistanceVsHangTimeChart(hitDistances, hangTimes);
        createHitDistanceVsPlayOutcomeChart(hitDistances, playOutcomes);
        createExitSpeedVsPlayOutcomeChart(exitSpeeds, playOutcomes);
    }
    console.log(jsonData);
    
    // launch angle vs exit speed
    function createLaunchVsSpeedChart(launchAngles, exitSpeeds) {
        const ctx = document.getElementById('launchVsSpeedChart').getContext('2d');
        new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Launch Angle vs Exit Speed',
                    data: launchAngles.map((angle, index) => ({
                        x: angle,
                        y: exitSpeeds[index]
                    })),
                    backgroundColor: 'rgba(255, 0, 0, 0.6)',
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Launch Angle (degrees)' } },
                    y: { title: { display: true, text: 'Exit Speed (MPH)' } }
                }
            }
        });
    }

    
    // exit speed vs hit distance 
    function createExitSpeedVsHitDistanceChart(exitSpeeds, hitDistances) {
        const ctx = document.getElementById('exitSpeedsVsHitDistanceChart').getContext('2d');
        new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Exit Speed vs Hit Distance',
                    data: exitSpeeds.map((speed, index) => ({
                        x: speed,  
                        y: hitDistances[index] 
                    })),
                    backgroundColor: 'rgba(0, 0, 255, 0.6)',  
                }]
            },
            options: {
                scales: {
                    x: { title: {   display: true, text: 'Exit Speed (MPH)'  } },
                    y: { title: {   display: true, text: 'Hit Distance (feet)'  } }
                        
                }
            }
        });
    }
    // hit distance vs hang time
    function createDistanceVsHangTimeChart(hitDistances, hangTimes) {
        const ctx = document.getElementById('distanceVsHangTimeChart').getContext('2d');
        new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Hit Distance vs Hang Time',
                    data: hitDistances.map((distance, index) => ({
                        x: distance,
                        y: hangTimes[index]
                    })),
                    backgroundColor: 'rgba(255, 0, 0, 0.6)',
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Hit Distance (feet)' } },
                    y: { title: { display: true, text: 'Hang Time (seconds)' } }
                }
            }
        });
    }
    // hit distance vs play outcome
    function createHitDistanceVsPlayOutcomeChart(hitDistances, playOutcomes) {
        const customOrder = [
            "Out", 
            "Single", 
            "Double", 
            "Triple", 
            "Home Run",   
            "Sacrifice", 
            "Fielders Choice", 
            "Undefined"
        ];
    
        //change HomeRun to Home Run
        const normalizedOutcomes = playOutcomes.map(outcome => {
            if (outcome === "HomeRun") return "Home Run";  
            if (outcome === "FieldersChoice") return "Fielders Choice";  
            return outcome || "Undefined"; 
        });
    
        const outcomeMap = {};
        normalizedOutcomes.forEach((outcome, index) => {
            if (!outcomeMap[outcome]) {
                outcomeMap[outcome] = [];
            }
            outcomeMap[outcome].push(hitDistances[index]);
        });
    
        const orderedLabels = customOrder.filter(label => outcomeMap[label] !== undefined);
        const avgHitDistances = orderedLabels.map(label => {
            const distances = outcomeMap[label] || [];
            return distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 0; 
        });
    
        // create bar chart
        const ctx = document.getElementById('hitDistanceVsPlayOutcomeChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: orderedLabels,  
                datasets: [{
                    label: 'Average Hit Distance vs Play Outcome',
                    data: avgHitDistances, 
                    backgroundColor: 'rgba(0, 0, 255, 0.6)',  
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Play Outcome' } },
                    y: { title: { display: true, text: 'Average Hit Distance (feet)' } }
                }
            }
        });
    }
    //exit speed vs play outcome
    function createExitSpeedVsPlayOutcomeChart(exitSpeeds, playOutcomes) {
        const customOrder = [
            "Out", 
            "Single", 
            "Double", 
            "Triple", 
            "Home Run",   
            "Sacrifice", 
            "Fielders Choice",  
            "Undefined"
        ];
    
        const normalizedOutcomes = playOutcomes.map(outcome => {
            if (outcome === "HomeRun") return "Home Run"; 
            if (outcome === "FieldersChoice") return "Fielders Choice";  
            return outcome || "Undefined";  
        });
    
        const outcomeMap = {};
        normalizedOutcomes.forEach((outcome, index) => {
            if (!outcomeMap[outcome]) {
                outcomeMap[outcome] = [];
            }
            outcomeMap[outcome].push(exitSpeeds[index]);
        });
    

        const orderedLabels = customOrder.filter(label => outcomeMap[label] !== undefined);
        const avgExitSpeeds = orderedLabels.map(label => {
            const speeds = outcomeMap[label] || [];
            return speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0; 
        });
    
        const ctx = document.getElementById('exitSpeedVsPlayOutcomeChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: orderedLabels,  
                datasets: [{
                    label: 'Average Exit Speed vs Play Outcome',
                    data: avgExitSpeeds,  
                    backgroundColor: 'rgba(255, 0, 0, 0.6)',  
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Play Outcome' } },
                    y: { title: { display: true, text: 'Average Exit Speed (MPH)' } }
                }
            }
        });
    }
    loadExcelData();
});

