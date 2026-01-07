// ==UserScript==
// @name         IXD Labor Tracking
// @version      1.0.5
// @description  Adds Calm Code Buttons into the FCLM Labor Tracking Kiosk for IXD with department customization
// @author       @grciasx
// @match        https://fcmenu-iad-regionalized.corp.amazon.com/*/laborTrackingKiosk*
// @match        http://fcmenu-iad-regionalized.corp.amazon.com/*/laborTrackingKiosk*
// @exclude      http://fcmenu-iad-regionalized.corp.amazon.com/do/laborTrackingKiosk*
// @exclude      https://fcmenu-iad-regionalized.corp.amazon.com/do/laborTrackingKiosk*
// @downloadURL  https://axzile.corp.amazon.com/-/carthamus/download_script/labor-tracking-1.user.js
// @updateURL    https://axzile.corp.amazon.com/-/carthamus/download_script/labor-tracking-1.user.js
// ==/UserScript==

// User preferences management
const STORAGE_KEY = 'laborTrackingPrefs';
let userPrefs = {
    departments: {},
    buttons: {},
    isSetup: false
};

// Load saved preferences
function loadPreferences() {
    const savedPrefs = localStorage.getItem(STORAGE_KEY);
    if (savedPrefs) {
        userPrefs = JSON.parse(savedPrefs);
    }
    return userPrefs;
}

// Save current preferences
function savePreferences() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userPrefs));cu
}

var css = document.createElement("style");
css.innerHTML += `
* {
    box-sizing: border-box;
}
html, body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
}
#fixed-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #232f3e;
    color: white;
    padding: 10px 20px;
    text-align: center;
    z-index: 9999; /* Extremely high z-index to ensure it's above everything */
    font-size: 14px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
#fixed-header a {
    color: #67c2ff;
    text-decoration: underline;
}
#fixed-header a:hover {
    text-decoration: none;
}
#body {
    display: flex;
    flex-flow: row nowrap;
    align-items: flex-start;
    justify-content: center;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    min-height: 100vh;
}
#body > .login {
    margin: 0;
    width: 25%;
    max-width: 300px;
}
#body > #toolbox {
    width: 75%;
    flex-grow: 2;
    font-size: 150%;
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
    margin: 0 auto;
}
#body > #toolbox > .row {
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    background: white;
}
#body > #toolbox > .row > h1 {
    border-bottom: 2px solid #e1e4e8;
    margin: 0 -10px 10px -10px;
    padding: 10px 15px;
    background: #f6f8fa;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.2em;
    color: #24292e;
    border-radius: 7px 7px 0 0;
    transition: background-color 0.2s ease;
}
#body > #toolbox > .row > h1:hover {
    background: #f1f4f7;
}
#body > #toolbox > .row > h1:after {
    content: '▼';
    font-size: 0.8em;
}
#body > #toolbox > .row > h1.collapsed:after {
    content: '▶';
}
#body > #toolbox > .row > .roles {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    padding: 10px;
    transition: max-height 0.3s ease-out;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

@media (max-width: 1200px) {
    #body > #toolbox > .row > .roles {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 900px) {
    #body > #toolbox > .row > .roles {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 600px) {
    #body > #toolbox > .row > .roles {
        grid-template-columns: 1fr;
    }
}
#body > #toolbox > .row > .roles.collapsed {
    display: none;
}
#body > #toolbox > .row > .roles > button {
    width: auto;
    min-width: 150px;
    max-width: 200px;
    background: #3498db;
    border-radius: 13px;
    border: 1px solid black;
    color: #ffffff;
    font-size: 14px;
    padding: 8px 10px;
    margin: 0 auto;
    min-height: 35px;
    height: auto;
    white-space: normal;
    overflow: hidden;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    word-wrap: break-word;
}
#body > #toolbox > .row > .roles > button:hover {
    background: #3cb0fd;
}
#body > #toolbox > .row > .roles > button.disabled {
    background: #ccc;
    cursor: not-allowed;
}
#setupModal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
}
#setupContent {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 30px;
    border-radius: 10px;
    max-width: 900px;
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.settings-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    z-index: 999;
}
.department-toggle {
    margin: 10px 0;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
}
.button-toggles {
    margin: 10px auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
    max-width: 1200px;
}
.select-all {
    padding: 4px 12px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
}
.select-all:disabled {
    background: #ccc;
    cursor: not-allowed;
}
.select-all:hover:not(:disabled) {
    background: #3cb0fd;
}
`;
document.querySelector("head").appendChild(css);

function movebox() {
    let attempts = 0;
    const maxAttempts = 20;
    
    function tryMove() {
        let waitForIt = document.querySelector('#body > .login');
        if (waitForIt) {
            waitForIt.style = '';
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryMove, 500);
        }
    }
    
    tryMove();
}

var codes = [
    {
        title: 'Presort/RC Sort',
        roles: [
            {name: 'Diverter', code: 'DIVERT'},
            {name: 'Presort', code: 'PRESRT'},
            {name: 'AIS 5lb Induct', code: 'AISOPSS'},
            {name: 'UIS Problem Solve', code: 'UISPS'},
            {name: 'UIS Case Prep', code: 'UISCASE'},
            {name: 'Water Spider', code: 'RCWS'},
            {name: 'UIS 5lb Super User', code: 'UIS5SU'},
            {name: 'RC Sort 5s', code: 'RSRT5S'},
            {name: 'UIS 20lb Case Prep',code: 'UISCASEXL'},
            {name: 'UIS SupUsr 20lb',code: 'UIS20SU'},
            {name: 'UIS 5lb PSolve',code: 'UIS5PS'},
            {name: 'UIS 20lb PSolve',code: 'UIS20PS'},
            {name: 'Tote Wrangling',code: 'TOTWR'},
            {name: 'UIS Tote Wrangler',code: 'UISTOTE'},
        ]
    },
    {
        title: 'Inbound Problem Solve (PS) / Inbound Support Services (ISS)',
        roles: [
            {name: 'Damage Processing', code: 'REBOX'},
            {name: 'Damages/IB Dock Amb', code: 'DAMAGES'},
            {name: 'IB Sweeper', code: 'LPSWEEP'},
            {name: 'ISS Field Rep', code: 'ICVR'},
            {name: 'Prep Problem Solve', code: 'PREPPS'},
            {name: 'Receive ProblemSolve', code: 'IBPS'},
            {name: 'Stow PSolve Backlog', code: 'PSBL'},
            {name: 'Stow to Prime PSolve', code: 'RECON'},
            {name: 'Decant Problem Solve', code: 'DCNTPS'},
            {name: 'Decant PSolve Backlog', code: 'DCNTPSBL'},
        ]
    },
    {
        title: 'Inbound Process Assistant',
        roles: [
            {name: 'Dock Lead/PA', code: 'LDOCK'},
            {name: 'Receive Lead/PA', code: 'RSLR'},
        ]
    },
    {
        title: 'Prep',
        roles: [
            {name: 'Prep Recorder', code: 'PRPOTH'},
            {name: 'Prep Kaizen', code: 'PRPKZN'},
            {name: 'Prep Area Organization', code: 'PRP5S'},
        ]
    },
    {
        title: 'Inbound Receive Dock / Receive Support',
        roles: [
            {name: 'Inbound Dock Clerk', code: 'RSVDC'},
            {name: 'Inbound TDR Team', code: 'RSVTDR'},
            {name: 'Inbound Yard Driver', code: 'RSVIYD'},
            {name: 'Parcel Identifier (PID) Truck Unload', code: 'PIDTRUNL'},
            {name: 'Receive Dock Crew', code: 'RSVCRW'},
            {name: 'Receive Line Loader', code: 'RSVLD'},
            {name: 'Vendor Line Load', code: 'VDRLDR'},
            {name: 'PID Manual Divert', code: 'PIDMNDIV'},
            {name: 'Vendor Cutter', code: 'VDRCUT'},
            {name: 'Receive AO', code: 'RSV5S'},
            {name: 'General Audits', code: 'GENAUDIT'},
            {name: 'IB Tote Replen', code: 'RSVRPL'},
            {name: 'MHE Support', code: 'MHERECS'},
            {name: 'Rcv Waterspider', code: 'WATER'},
            {name: 'PID Gatekeep', code: 'PIDGATEKEEP'},
            {name: 'Receive Dock Crew (AVP1, FTW1)', code: 'RSDOCK'},
            {name: 'Receive Line Unloader (Legacy Sites Only)', code: 'RSVULD'},
        ]
    },
    {
        title: 'Inbound Indirect',
        roles: [
            {name: 'Cart/Pallet Builder', code: 'PLTBLD'},
            {name: 'Line Load Injection', code: 'LINLINJT'},
            {name: 'Transship Transport', code: 'TSHPTP'},
            {name: 'Cart Runner Trans', code: 'CRNTRA'},
            {name: 'Tote Staging', code: 'TOTSTG'},
            {name: 'TransferIn Dock Crew', code: 'TRFICR'},
            {name: 'Transfer In 5S', code: 'TRFI5S'},
            {name: 'Transfer In Kaizen', code: 'TRFIKZ'},
            {name: 'Transfer in Dock Clerk', code: 'TITDC'},
            {name: 'Kermit Operator', code: 'KERMIT'},
            {name: 'Trans Cart Run-Nike', code: 'NIKETRANSCART'},
        ]
    },
    {
        title: 'Outbound',
        roles: [
            {name: 'Fluid Load Sweeper', code: 'FSWEEP'},
            {name: 'Trans Out Prob Solve', code: 'PSTOPS'},
            {name: 'Workflow', code: 'WRKFLOW'},
            {name: 'Robotic Water Spider', code: 'ROBWS'},
            {name: 'Robotic Operator', code: 'ROBWS'},
            {name: 'Trans Out Overflow', code: 'OVRFLW'},
            {name: 'Wall Builder', code: 'WALLBLD'},
            {name: 'Water Spider', code: 'EOLWS'},
            {name: 'Transfer Out AO', code: 'TRFO5S'},
        ]
    },
    {
        title: 'Transfer Out Ship Dock',
        roles: [
            {name: 'Shipping Clerk', code: 'SHPCL'},
            {name: 'Transfer Out Dock Crew', code: 'TRFOCR'},
            {name: 'Truck Loader', code: 'MTTL'},
            {name: 'Outbound Dock Crew', code: 'OUTCRW'},
        ]
    },
    {
        title: 'Transfer Out Process Assistant',
        roles: [
            {name: 'Transfer Out Lead PA', code: 'TOTOL'},
            {name: 'RC Sort Lead PA', code: 'RSRSL'},
        ]
    },
    {
        title: 'Learning',
        roles: [
            {name: 'Training Event', code: 'LNTRAIN'},
            {name: 'Ambassador Training', code: 'LNAMB'},
            {name:'Prep Ambassador', code: 'PREPAMB'},
            {name:'Prep Training', code: 'PRPTR'},
            {name:'Receive Ambassador', code: 'RAMB'},
            {name:'Receive Training', code: 'RSVTR'},
            {name: 'RC Sort Ambassador', code: 'RCRSA'},
            {name: 'RC Sort Training', code: 'RSRTTR'},
            {name: 'Transfer In Training', code: 'TRFITR'},
            {name: 'Transfer In Ambassador', code: 'TITA'},
            {name: 'Transfer Out Amassador', code: 'TOTOA'},
            {name: 'Transfer Out Traning', code: 'TRFOTR'},
            {name: 'TDR Class', code: 'LNTDRC'},
            {name: 'PIT Class', code: 'LNPITC'},
            {name: 'Learning Other', code: 'LNMISC'},
        ]
    },
    {
        title: 'SEV1 and SEV2, TLD Assignments',
        roles: [
            {name: 'Sev1&2 Events', code: 'SEV1_2'},
            {name: 'Weather Sev1&2 Event', code: 'WTHRSEV'},
            {name: 'RME Sev1&2 Event', code: 'RMESEV'},
            {name: 'Network Sev1&2 Event', code: 'NTWRKSEV'},
            {name: 'TLD Assignment', code: 'TLDA'},
        ]
    },
    {
        title: 'Other',
        roles: [
            {name: 'ISTOP', code: 'ISTOP'},
            {name: 'MSTOP', code: 'MSTOP'},
        ]
    },
];

function showSetupModal() {
    const modal = document.createElement('div');
    modal.id = 'setupModal';
    
    let content = `
        <div id="setupContent">
            <h2>Labor Tracking Setup</h2>
            <p>Select the departments you oversee and customize visible buttons:</p>
            <div id="departmentList">
    `;
    
    codes.forEach(dept => {
        const isChecked = userPrefs.departments[dept.title] !== false;
        content += `
            <div class="department-toggle">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <label>
                        <input type="checkbox" name="dept" value="${dept.title}" ${isChecked ? 'checked' : ''}>
                        <strong>${dept.title}</strong>
                    </label>
                    <button class="select-all" data-dept="${dept.title}" ${isChecked ? '' : 'disabled'}>
                        Select All
                    </button>
                </div>
                <div class="button-toggles">
        `;
        
        dept.roles.forEach(role => {
            const isButtonEnabled = userPrefs.buttons[role.code] !== false;
            content += `
                <label>
                    <input type="checkbox" name="button" 
                           data-dept="${dept.title}" 
                           value="${role.code}" 
                           ${isButtonEnabled ? 'checked' : ''}>
                    ${role.name}
                </label>
            `;
        });
        
        content += '</div></div>';
    });
    
    content += `
            </div>
            <button id="saveSetup" style="margin-top: 20px;">Save Preferences</button>
        </div>
    `;
    
    modal.innerHTML = content;
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Initialize department checkboxes based on selected roles
    codes.forEach(dept => {
        const deptToggle = document.querySelector(`input[name="dept"][value="${dept.title}"]`).closest('.department-toggle');
        const deptCheckbox = deptToggle.querySelector('input[name="dept"]');
        const buttonToggles = deptToggle.querySelectorAll('input[name="button"]');
        const selectAllBtn = deptToggle.querySelector('.select-all');
        
        // Check if any roles in this department are enabled
        const hasEnabledRoles = dept.roles.some(role => userPrefs.buttons[role.code] !== false);
        
        if (hasEnabledRoles && !deptCheckbox.checked) {
            deptCheckbox.checked = true;
        }
        
        // Always keep role checkboxes enabled so users can select individual roles
        // Only disable the Select All button if department is unchecked
        selectAllBtn.disabled = !deptCheckbox.checked;
    });
    
    // Setup event handlers
    document.getElementById('saveSetup').addEventListener('click', () => {
        const checkedDepts = document.querySelectorAll('#departmentList input[name="dept"]:checked');
        const checkedButtons = document.querySelectorAll('#departmentList input[name="button"]:checked');
        
        // Reset preferences
        userPrefs.departments = {};
        userPrefs.buttons = {};
        
        // Save department preferences
        codes.forEach(dept => {
            userPrefs.departments[dept.title] = false;
        });
        checkedDepts.forEach(checkbox => {
            userPrefs.departments[checkbox.value] = true;
        });
        
        // Save button preferences
        document.querySelectorAll('#departmentList input[name="button"]').forEach(button => {
            userPrefs.buttons[button.value] = button.checked;
        });
        
        userPrefs.isSetup = true;
        savePreferences();
        modal.remove();
        renderToolbox();
    });
    
    // Department checkbox controls its buttons
    document.querySelectorAll('input[name="dept"]').forEach(deptCheckbox => {
        deptCheckbox.addEventListener('change', (e) => {
            const deptToggle = e.target.closest('.department-toggle');
            const buttonToggles = deptToggle.querySelectorAll('input[name="button"]');
            const selectAllBtn = deptToggle.querySelector('.select-all');
            
            if (!e.target.checked) {
                // When department is unchecked, uncheck all roles but keep them enabled
                // so users can still select individual roles
                buttonToggles.forEach(button => {
                    button.checked = false;
                });
            }
            
            // Always keep role checkboxes enabled so users can select individual roles
            // The Select All button should be disabled only if department is unchecked
            selectAllBtn.disabled = !e.target.checked;
        });
    });
    
    // Role checkbox ensures department is checked
    document.querySelectorAll('input[name="button"]').forEach(roleCheckbox => {
        roleCheckbox.addEventListener('change', (e) => {
            const deptToggle = e.target.closest('.department-toggle');
            const deptCheckbox = deptToggle.querySelector('input[name="dept"]');
            const buttonToggles = deptToggle.querySelectorAll('input[name="button"]');
            const selectAllBtn = deptToggle.querySelector('.select-all');
            
            if (e.target.checked) {
                // If any role is checked, ensure department is enabled
                if (!deptCheckbox.checked) {
                    deptCheckbox.checked = true;
                    
                    // Enable all role checkboxes in this department
                    buttonToggles.forEach(button => {
                        button.disabled = false;
                    });
                    
                    // Enable the Select All button
                    selectAllBtn.disabled = false;
                }
            } else {
                // If no roles are checked in this department, optionally uncheck department
                const anyRoleChecked = Array.from(buttonToggles).some(button => button.checked);
                if (!anyRoleChecked) {
                    // Optionally uncheck department if no roles are selected
                    // Uncomment the next line if you want department to auto-uncheck when no roles are selected
                    // deptCheckbox.checked = false;
                    
                    // Keep buttons enabled so user can still select them
                    // but disable Select All button since nothing is selected
                    selectAllBtn.disabled = false;
                }
            }
        });
    });

    // Select All button functionality
    document.querySelectorAll('.select-all').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const deptToggle = e.target.closest('.department-toggle');
            const buttonToggles = deptToggle.querySelectorAll('input[name="button"]:not(:disabled)');
            const allChecked = Array.from(buttonToggles).every(b => b.checked);
            
            buttonToggles.forEach(button => {
                button.checked = !allChecked;
            });
        });
    });
}

function renderToolbox() {
    // Remove any existing toolbox element first
    const existingToolbox = document.getElementById('toolbox');
    if (existingToolbox) {
        existingToolbox.remove();
    }
    
    // Create new toolbox element
    const toolbox = document.createElement('div');
    toolbox.id = 'toolbox';
    
    let toolboxHTML = '';
    codes.forEach(shift => {
        if (userPrefs.departments[shift.title] !== false) {
            toolboxHTML += `
                <div class="row">
                    <h1>${shift.title}</h1>
                    <div class="roles">
            `;
            
            shift.roles.forEach(role => {
                const isDisabled = userPrefs.buttons[role.code] === false;
                if (!isDisabled) {
                    toolboxHTML += `
                        <button value="${role.code}">${role.name}</button>
                    `;
                }
            });
            
            toolboxHTML += '</div></div>';
        }
    });
    
    toolbox.innerHTML = toolboxHTML;
    
    // Add settings button
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'settings-btn';
    settingsBtn.textContent = '⚙️ Settings';
    settingsBtn.onclick = showSetupModal;
    toolbox.appendChild(settingsBtn);
    
    // Add the new toolbox to the DOM
    document.querySelector('#body').appendChild(toolbox);
    
    // Add click handlers with event delegation
    toolbox.addEventListener('click', (event) => {
        if (event.target.matches('.roles > button')) {
            document.getElementById('calmCode').value = event.target.value;
            document.forms[0].submit();
        } else if (event.target.matches('.row > h1')) {
            event.target.classList.toggle('collapsed');
            event.target.nextElementSibling.classList.toggle('collapsed');
        }
    });
}

// Create fixed header that stays at the top of the page
function createFixedHeader() {
    const header = document.createElement('div');
    header.id = 'fixed-header';
    header.innerHTML = `
        <div>
            <strong>IXD Labor Track Codes Policy:</strong> 
            <a href="https://policy.a2z.com/docs/629387/publication" target="_blank">Please reference policy if unsure which LT code to use</a>
        </div>
        <div>
            <strong>Maintainers:</strong> 
            <a href="https://w.amazon.com/bin/view/ONT8_Software_Development/Dev_Team/" target="_blank">Dev Team</a>
        </div>
    `;
    // Insert as the very first element in the body to ensure it's at the top
    document.body.prepend(header);
    
    // Add padding to body to prevent content from being hidden under the header
    const headerHeight = header.offsetHeight;
    document.body.style.paddingTop = headerHeight + 'px';
}

// Initialize
function init() {
    // Create the fixed header first to ensure it's at the top
    createFixedHeader();
    
    loadPreferences();
    movebox();
    
    if (!userPrefs.isSetup) {
        showSetupModal();
    } else {
        renderToolbox();
    }
}

init();