// ==UserScript==
// @name         Matome
// @namespace    http://tampermonkey.net/
// @version      3.9.1
// @description  Bring the power of LLMs to where you do most of your writing using Matome & Bedrock
// @author       Pronoy Chopra (pronoc@)
// @match        https://quip-amazon.com/*
// @match        https://prod.matome.tools.aws.dev/*
// @match        https://dev-matome.pronoc.people.aws.dev/*
// @match        https://amazon.awsapps.com/workdocs*
// @match        https://marshal.corp.amazon.com/*
// @match        https://sim.amazon.com/*
// @match        https://hire.amazon.com/*
// @match        https://forte.talent.a2z.com/*
// @match        https://t.corp.amazon.com/*
// @match        http://localhost:3000/*
// @connect      quip-amazon.com
// @connect      platform.quip-amazon.com
// @connect      maxis-service-prod-pdx.amazon.com
// @connect      search.eu-west-1.prod.marshal.ie.wwps.aws.dev
// @connect      w.amazon.com
// @connect      dev-matome.pronoc.people.aws.dev
// @updateURL    https://axzile.corp.amazon.com/-/carthamus/download_script/matome.user.js
// @downloadURL  https://axzile.corp.amazon.com/-/carthamus/download_script/matome.user.js
// @copyright    AWS
// @require      https://improvement-ninjas.amazon.com/GreaseMonkey/jquery.min.js
// @grant        GM_addStyle
// @grant        GM_info
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        devMode: false,
        localMode: false,
        version: GM_info.script.version
    };

    // Add the ASCII art logo
    const ui = `
                        @@@@@@@@     @@@@@@@@     @@@@@@@@
                      @@@@#**%@@@   @@@%**#@@@   @@@%**#@@@@
                    @@@@%#####%@@@@@@@%%%%%%@@@@@@@%####*%@@@@
             @@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@
           @@@@%+------------------------------------------------+#@@@@
         @@@@=-------------------=======++=======--------------------%@@@
        @@@+-----%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%-----+@@@
       @@@+----%@@#-::::::..............................::::::-#@@%----=@@@
       @@%----#@%-:.....:=**=:......................:=**=:......:%@#----%@@
       @@%----@@+::...=@@@@@@@@+..................+@@@@@@@@+.....+@@----#@@
    @@@@@#---+@@-::..*@@+----=@@#................#@@+----=@@#....-@@+---*@@@@@
  @@@@@@@*---+@@:::.-@@+------=@@-..............:@@=------+@@-....@@*---+@@@@@@@
@@@@**#@@+---*@@:::.:@@*------+@@-..............:@@+------*@@-....%@#---+@@#**@@@@
@@@***#@@=---#@%:::..-@@%----#@@+................+@@#----#@@=.....#@#---=@@#***@@@
@@%***#@@=---#@#:::...:#@@@@@@%:..................:#@@@@@@#:......#@#----@@#***%@@
@@%***#@@=---#@#::.......::::.....*#-........-#*.....::::.........*@%----@@%***%@@
@@%***%@@----%@*:::------:........@@*........+@@........:------:..*@%----@@%***%@@
@@%***%@@----%@*::+@@@@@@#........=@@=......=@@+........#@@@@@@+..*@%----@@%***%@@
@@@#**%@@----#@#:::................-@@@%**%@@@-...................*@%----@@%**#@@@
@@@@#*%@@----#@#::*@@@@@@%...........:*@@@@*:...........#@@@@@@*..#@#----@@%*#@@@@
  @@@@@@@----#@%:::::::::................................::::::...#@#----@@@@@@@
    @@@@@----*@@:::...............................................%@#----@@@@@
      @@@=----*=:::..............................................:@@*----@@@
      @@@=-----::::..............................................-@@+---=@@@
      @@@+----@@+::..............................................+@@----=@@@
      @@@+----#@%::.............................................:%@#----+@@@
       @@*-----%@@%=:.........................................-%@@%-----*@@
       @@#-------#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#=------#@@
       @@%-----------------======++++++++++++++++======-----------------#@@
       @@@=-------------------------------------------------------------%@@
       @@@%------------------------------------------------------------#@@@
        @@@%----------------------------------------------------------%@@@
          @@@%------------------------------------------------------%@@@
           @@@@@@%##**+++==----------------------------==+++**##%@@@@@@
              @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                                  @@%***##***%@@
                     @@@@@@@@@@@@@@@%********%@@@@@@@@@@@@@@@
                   @@@@@%#*++=----+@@#******#@@+----==+*#%@@@@@
                 @@@%---++----+=---+@@@%##%@@@+--------------%@@
                @@@=---*@@+---@@-----=%@@@@%=------------------@@
               @@@+---+@%@@=--@@@-------------------------------@@
               @@%----%@@@@%--@@--------------------------------%@@
               @@#---#@*==#@+-@@--------------------------------#@@
               @@#==============================================*@@@
               @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
`;
    console.log(ui);

    // Add CSS styles
    GM_addStyle(`
        .switch {
          position: relative;
          display: inline-block;
          width: 42px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          -webkit-transition: .4s;
          transition: .4s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          -webkit-transition: .4s;
          transition: .4s;
        }

        input:checked + .slider {
          background-color: rgb(230, 106, 157);
        }

        input:checked + .slider:before {
          -webkit-transform: translateX(18px);
          -ms-transform: translateX(18px);
          transform: translateX(18px);
        }

        .slider.round {
          border-radius: 34px;
        }

        .slider.round:before {
          border-radius: 50%;
        }

        .toggle-label {
          margin-left: 10px;
          display: inline-block;
          vertical-align: middle;
        }

        .marshal-label {
          color: white;
        }

        .loader {
          width: 40px;
          height: 26px;
          --c:no-repeat linear-gradient(#000 0 0);
          background:
            var(--c) 0    100%,
            var(--c) 50%  100%,
            var(--c) 100% 100%;
          background-size:8px calc(100% - 4px);
          position: relative;
        }
        .loader:before {
          content: "";
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #000;
          left: 0;
          top: 0;
          animation:
            l3-1 1.5s  linear infinite alternate,
            l3-2 0.75s cubic-bezier(0,200,.8,200) infinite;
        }
        @keyframes l3-1 {
          100% {left:calc(100% - 8px)}
        }
        @keyframes l3-2 {
          100% {top:-0.1px}
        }

        #matome-resize-handle {
          transition: background-color 0.2s;
        }

        #matome-resize-handle:hover {
          background-color: #888;
        }

        #matome-resize-handle:active {
          background-color: #666;
        }
    `);

    // Core module for shared functionality
    const MatomeCore = {
        // Configuration
        config: {
            devMode: CONFIG.devMode,
            localMode: CONFIG.localMode,
            matomeBaseURI: '',
            iframeID: 'matomeIframe',
            version: CONFIG.version,
            originalUrl: window.location.href // Store the complete original URL
        },

        // Initialize configuration
        init: function () {
            const devUrl = this.config.localMode ? "http://localhost:3000" : "https://dev-matome.pronoc.people.aws.dev";
            this.config.matomeBaseURI = this.config.devMode ? devUrl : 'https://prod.matome.tools.aws.dev';

            // Log the original URL and hash for debugging
            console.log('Matome: Original URL:', this.config.originalUrl);

            return this;
        },

        // Get the final URI based on site and configuration
        getFinalURI: function (origin, chatType) {
            let uri = '';
            const baseURI = this.config.matomeBaseURI;
            const version = this.config.version;
            const devParam = this.config.devMode && !this.config.localMode ?
                `&devMode=${this.config.devMode}&overrideAPIBase=api.matome.pronoc.people.aws.dev` : '';

            switch (origin) {
                case "https://amazon.awsapps.com":
                    uri = `${baseURI}/workdocs?disableAutoHighlight=true&scriptVersion=${version}${devParam}`;
                    break;
                case "https://quip-amazon.com":
                    uri = this.config.devMode && !this.config.localMode ?
                        `${baseURI}/${chatType}?scriptVersion=${version}${devParam}` :
                        `${baseURI}/matome-for-quip?scriptVersion=${version}`;
                    break;
                case "https://marshal.corp.amazon.com":
                    uri = this.config.devMode && !this.config.localMode ?
                        `${baseURI}/${chatType}?scriptVersion=${version}${devParam}` :
                        `${baseURI}/marshal?scriptVersion=${version}`;
                    break;
                case "https://hire.amazon.com":
                    uri = this.config.devMode && !this.config.localMode ?
                        `${baseURI}/hire?scriptVersion=${version}${devParam}` :
                        `${baseURI}/hire?scriptVersion=${version}`;
                    break;
                case "https://forte.talent.a2z.com":
                    uri = this.config.devMode && !this.config.localMode ?
                        `${baseURI}/hire?scriptVersion=${version}${devParam}` :
                        `${baseURI}/chat?scriptVersion=${version}`;
                    break;
                default:
                    uri = this.config.devMode && !this.config.localMode ?
                        `${baseURI}/${chatType}?scriptVersion=${version}${devParam}` :
                        `${baseURI}/matome-for-quip?scriptVersion=${version}`;
            }

            return uri;
        },

        // Create UI elements (container, sidebar, iframe)
        createUI: function (siteName) {

            // Create container
            const container = document.createElement('div');
            container.id = 'custom-container';
            container.style.display = 'block'; // Changed from 'grid' to 'block'
            container.style.width = '100vw';
            container.style.height = '100vh';
            container.style.overflow = 'hidden';
            container.style.position = 'relative'; // Add this
            container.style.float = 'left'; // Add this to ensure it aligns properly

            // Move all existing body content into the container
            while (document.body.firstChild) {
                container.appendChild(document.body.firstChild);
            }

            // Append the container to the body
            document.body.appendChild(container);

            // Create iframe
            const iframe = document.createElement('iframe');
            iframe.id = this.config.iframeID;
            iframe.allow = "clipboard-write";
            iframe.style.width = '100%';
            iframe.style.height = '100%';

            // Create sidebar
            const sidebar = document.createElement('div');
            sidebar.id = 'custom-sidebar';
            sidebar.style.position = 'fixed';
            sidebar.style.top = '0';
            sidebar.style.right = '0';
            sidebar.style.width = '25%';
            sidebar.style.height = '100vh';
            sidebar.style.backgroundColor = '#f4f4f4';
            sidebar.style.zIndex = '1000';
            sidebar.style.overflowY = 'auto';
            sidebar.style.padding = '0';
            sidebar.style.display = 'none';

            // Create resize handle
            const resizeHandle = document.createElement('div');
            resizeHandle.id = 'matome-resize-handle';
            resizeHandle.style.position = 'fixed';
            resizeHandle.style.top = '0';
            resizeHandle.style.right = '25%'; // Initial position matching sidebar width
            resizeHandle.style.width = '5px';
            resizeHandle.style.height = '100vh';
            resizeHandle.style.backgroundColor = '#ccc';
            resizeHandle.style.cursor = 'col-resize';
            resizeHandle.style.zIndex = '1001'; // Higher than sidebar
            resizeHandle.style.display = 'none'; // Initially hidden like sidebar

            // Add the resize handle to the body
            document.body.appendChild(resizeHandle);

            // Setup resize functionality
            let isResizing = false;
            let lastX = 0;

            resizeHandle.addEventListener('mousedown', (e) => {
                isResizing = true;
                lastX = e.clientX;
                document.body.style.userSelect = 'none'; // Prevent text selection during resize
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                const deltaX = e.clientX - lastX;
                lastX = e.clientX;

                // Get current widths
                const containerWidth = parseFloat(container.style.width);
                const sidebarWidth = parseFloat(sidebar.style.width);

                // Calculate new widths (as percentages)
                const newContainerWidth = Math.max(50, Math.min(90, containerWidth + deltaX * 0.1));
                const newSidebarWidth = 100 - newContainerWidth;

                // Apply new widths
                container.style.width = `${newContainerWidth}%`;
                sidebar.style.width = `${newSidebarWidth}%`;
                resizeHandle.style.right = `${newSidebarWidth}%`;
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
                document.body.style.userSelect = '';
            });

            // Create loading element
            const loadingElement = document.createElement('div');
            loadingElement.id = 'matome-loading';
            loadingElement.textContent = `Matome for ${siteName} ${this.config.version}`;
            loadingElement.style.display = 'flex';
            loadingElement.style.justifyContent = 'center';
            loadingElement.style.alignItems = 'center';
            loadingElement.style.height = '100%';
            loadingElement.style.fontSize = '24px';
            loadingElement.style.fontWeight = 'bold';

            // Append elements
            sidebar.appendChild(loadingElement);
            sidebar.appendChild(iframe);
            document.body.appendChild(sidebar);

            return {
                container,
                sidebar,
                iframe,
                loadingElement,
                resizeHandle
            };
        },

        // Toggle sidebar visibility
        toggleSidebar: function (container, sidebar, resizeHandle, show) {
            if (show) {
                // When showing sidebar, reduce container width to make room
                container.style.width = '75%';
                sidebar.style.display = 'block';
                resizeHandle.style.display = 'block';
                resizeHandle.style.right = '25%'; // Reset to default position
            } else {
                // When hiding sidebar, expand container to full width
                container.style.width = '100%';
                sidebar.style.display = 'none';
                resizeHandle.style.display = 'none';
            }
        },

        // Setup text selection handlers
        setupTextSelection: function (iframe) {
            const getSelections = () => {
                const selection = window.getSelection();
                if (selection.type === 'Range') {
                    const selectedText = selection.toString();

                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({
                            action: 'setTextareaValue',
                            value: selectedText,
                        }, this.config.matomeBaseURI);
                    }
                } else {
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({
                            action: 'clearTextareaValue',
                            value: true,
                        }, this.config.matomeBaseURI);
                    }
                }
            };

            document.addEventListener('mouseup', getSelections);
            document.addEventListener('keyup', getSelections);
        },

        // Handle scrape requests
        handleScrapeRequest: function (iframe, requestURI) {
            GM_xmlhttpRequest({
                method: 'GET',
                url: requestURI,
                onload: function (responseDetails) {
                    let data;
                    let type;
                    try {
                        type = 'json';
                        data = JSON.parse(responseDetails.responseText);
                    } catch (e) {
                        type = 'html';
                        data = responseDetails.responseText;
                    }

                    iframe.contentWindow.postMessage({
                        type: type,
                        action: 'MatomeScrapeGETResponse',
                        value: data,
                    }, MatomeCore.config.matomeBaseURI);
                }
            });
        },

        // Setup basic message handling
        setupMessageHandling: function (iframe) {
            window.addEventListener('message', (event) => {
                // Validate the origin of the message
                if (event.origin !== this.config.matomeBaseURI) {
                    return;
                }

                try {
                    const eventData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                    if (eventData.requestType === "MatomeScrapeGETRequest") {
                        this.handleScrapeRequest(iframe, eventData.requestURI);
                    }
                } catch (error) {
                    console.error("Error processing message:", error);
                }
            });
        }
    };

    // Initialize MatomeCore
    MatomeCore.init();

    // Token management module
    const TokenManager = {
        tokenCache: {
            token: null
        },

        getTokenExpiry: function (token) {
            try {
                const payload = token.split('.')[1];
                const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
                return decodedPayload.exp * 1000;
            } catch (error) {
                console.error('Error decoding token:', error);
                return null;
            }
        },

        getMarshalToken: function () {
            return new Promise((resolve, reject) => {
                const currentTime = new Date().getTime();

                if (this.tokenCache.token) {
                    const expiry = this.getTokenExpiry(this.tokenCache.token);
                    if (expiry && currentTime < expiry) {
                        console.log("Using cached token");
                        return resolve(this.tokenCache.token);
                    }
                }

                console.log("Matome/Marshal - Fetching new token");
                GM_xmlhttpRequest({
                    method: "GET",
                    url: 'https://marshal.corp.amazon.com/session',
                    onload: function (response) {
                        if (response.status === 200) {
                            const data = JSON.parse(response.responseText);
                            const token = data.result.token;

                            TokenManager.tokenCache.token = token;
                            GM_setValue("cachedToken", token);

                            resolve(token);
                        } else {
                            reject("Failed to get token");
                        }
                    },
                    onerror: function (error) {
                        reject(error);
                    }
                });
            });
        },

        isMarshalTokenValid: function (token) {
            return new Promise((resolve) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: "https://user.eu-west-1.prod.marshal.ie.wwps.aws.dev/user",
                    headers: {
                        "Anti-Csrftoken-A2z": token
                    },
                    onload: function (response) {
                        resolve(response.status === 200);
                    },
                    onerror: function () {
                        resolve(false);
                    }
                });
            });
        },

        getValidMarshalToken: async function () {
            if (!this.tokenCache.token && GM_getValue("cachedToken")) {
                this.tokenCache.token = GM_getValue("cachedToken");

                const expiry = this.getTokenExpiry(this.tokenCache.token);
                const currentTime = new Date().getTime();
                if (expiry && currentTime >= expiry) {
                    this.tokenCache.token = null;
                }
            }

            if (this.tokenCache.token) {
                const isValid = await this.isMarshalTokenValid(this.tokenCache.token);
                if (isValid) {
                    return this.tokenCache.token;
                }
                this.tokenCache.token = null;
            }

            return this.getMarshalToken();
        }
    };

    // API module for making requests
    const ApiModule = {
        MARSHAL_TARGET_LINK: "https://search.eu-west-1.prod.marshal.ie.wwps.aws.dev",
        MARSHAL_USER_VALID_LINK: "https://user.eu-west-1.prod.marshal.ie.wwps.aws.dev/user",

        makeMarshalCallForInsight: function (token, insight) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `${this.MARSHAL_TARGET_LINK}/search${insight}`,
                    headers: {
                        "Anti-Csrftoken-A2z": token
                    },
                    onload: function (response) {
                        if (response.status === 200) {
                            const result = JSON.parse(response.responseText);
                            resolve(result);
                        } else {
                            reject("Failed to get data");
                        }
                    },
                    onerror: function (error) {
                        console.error("Error while making call");
                        console.log(error);
                        reject(error);
                    }
                });
            });
        },

        makeMarshalCallForReport: function (token, reportTemplateID) {
            console.log(`Making report template ID Call ${reportTemplateID}`);

            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `${this.MARSHAL_TARGET_LINK}/search/report_template/${reportTemplateID}`,
                    headers: {
                        "Anti-Csrftoken-A2z": token
                    },
                    onload: function (response) {
                        if (response.status === 200) {
                            const result = JSON.parse(response.responseText);
                            resolve(result);
                        } else {
                            reject("Failed to get report data");
                        }
                    },
                    onerror: function (error) {
                        console.error("Error while making a call to fetch report template");
                        console.log(error);
                        reject(error);
                    }
                });
            });
        },

        marshalCallWithToken: async function (insight) {
            try {
                const token = await TokenManager.getValidMarshalToken();
                const result = await this.makeMarshalCallForInsight(token, insight);

                return {
                    insightID: result.resource_id,
                    title: result.title,
                    description: result.description,
                    category: result.category
                };
            } catch (error) {
                console.error("An error occurred:", error);
            }
        },

        fetchMarshalInsights: function (insights) {
            const insightExpansionPromises = [];

            insights.forEach((insight) => {
                const promise = this.marshalCallWithToken(insight.href)
                    .then((result) => result)
                    .catch((error) => {
                        console.error(`Error processing ${insight.label}:`, error);
                        return null;
                    });

                insightExpansionPromises.push(promise);
            });

            return Promise.all(insightExpansionPromises);
        },

        fetchMarshalReportSections: function (reportLink) {
            if (!reportLink) {
                return Promise.resolve([]);
            }

            const reportTemplateId = reportLink.split("/").pop();
            return this.marshalReportCallWithToken(reportTemplateId);
        },

        marshalReportCallWithToken: async function (reportTemplateID) {
            try {
                const token = await TokenManager.getValidMarshalToken();
                const result = await this.makeMarshalCallForReport(token, reportTemplateID);

                return result.sections.map(section => section.title);
            } catch (error) {
                console.error("An error occurred:", error);
            }
        }
    };
    const QuipModule = {
        init: function (matomeCore) {
            this.matomeCore = matomeCore;
            this.iframeSrcLoaded = false;
            this.waitForNavbar();
        },

        waitForNavbar: function () {
            const observer = new MutationObserver((mutations, obs) => {
                const navbar = document.querySelector('div.buttons');
                if (navbar) {
                    obs.disconnect();
                    console.log('Navbar found');
                    this.setupToggle(navbar);
                }
            });

            observer.observe(document.body, {childList: true, subtree: true});
        },

        setupToggle: function (navbar) {
            const divButtons = $('div.buttons');

            if (divButtons.length) {
                // Create toggle switch
                const label = $('<label>Matome', {
                    class: 'switch',
                    html: $('<input>', {
                        type: 'checkbox',
                        id: 'matomeToggleInput'
                    }).add('<span class="slider round"></span>')
                }).prependTo(divButtons);

                // Add label text
                $('<span>', {
                    class: 'toggle-label',
                    text: this.matomeCore.config.devMode ?
                        (this.matomeCore.config.localMode ? 'Matome(local)' : 'Matome(dev)') :
                        'Matome '
                }).insertBefore(label);

                // Create UI elements
                this.ui = this.matomeCore.createUI('Quip');

                // Setup toggle behavior
                $("#matomeToggleInput").on('change', this.handleToggle.bind(this));

                // Setup text selection and message handling
                this.matomeCore.setupTextSelection(this.ui.iframe);
                this.matomeCore.setupMessageHandling(this.ui.iframe);

                // Setup Quip-specific message handling
                this.setupQuipSpecificHandling();
            }
        },

        handleToggle: function () {
            if (this.ui.sidebar.style.display === 'none') {
                this.matomeCore.toggleSidebar(this.ui.container, this.ui.sidebar, this.ui.resizeHandle, true);

                if (!this.iframeSrcLoaded) {
                    const finalURI = this.matomeCore.getFinalURI(window.location.origin, 'matomeChatURI');
                    this.ui.iframe.src = finalURI;
                    this.iframeSrcLoaded = true;

                    this.ui.iframe.addEventListener('load', () => {
                        const loadingElement = document.getElementById('matome-loading');
                        if (loadingElement) {
                            loadingElement.remove();
                        }
                    });
                }
            } else {
                this.matomeCore.toggleSidebar(this.ui.container, this.ui.sidebar, this.ui.resizeHandle, false);
            }
        },

        setupQuipSpecificHandling: function () {
            // Add Quip-specific message handling
            window.addEventListener('message', (event) => {
                if (event.origin !== this.matomeCore.config.matomeBaseURI) {
                    return;
                }

                try {
                    const eventData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                } catch (error) {
                    console.error("Error processing Quip-specific message:", error);
                }
            });
        },

    };

    // Marshal-specific module
    const MarshalModule = {
        init: function (matomeCore) {
            this.matomeCore = matomeCore;
            this.iframeSrcLoaded = false;
            this.waitForNavbar();
        },

        waitForNavbar: function () {
            const observer = new MutationObserver((mutations, obs) => {
                const navbar = document.querySelector('nav.navbar');
                if (navbar) {
                    obs.disconnect();
                    console.log('Navbar found');
                    this.setupToggle(navbar);
                }
            });

            observer.observe(document.body, {childList: true, subtree: true});
        },

        setupToggle: function (navbar) {
            // Create toggle switch
            const label = $('<label>Matome ', {
                class: 'switch',
                html: $('<input>', {
                    type: 'checkbox',
                    id: 'matomeToggleInput'
                }).add('<span class="slider round"></span>')
            }).appendTo(navbar);

            // Add label text
            $('<span>', {
                class: 'toggle-label marshal-label',
                text: this.matomeCore.config.devMode ?
                    (this.matomeCore.config.localMode ? 'Matome(local) ' : 'Matome(dev) ') :
                    'Matome '
            }).insertBefore(label);

            // Create UI elements
            this.ui = this.matomeCore.createUI('Marshal');

            // Setup toggle behavior
            $("#matomeToggleInput").on('change', this.handleToggle.bind(this));

            // Setup text selection and message handling
            this.matomeCore.setupTextSelection(this.ui.iframe);
            this.matomeCore.setupMessageHandling(this.ui.iframe);

            // Setup Marshal-specific functionality
            this.setupMarshalSpecificHandling();
            this.setupCheckboxObserver();
        },

        handleToggle: function () {
            if (this.ui.sidebar.style.display === 'none') {
                this.matomeCore.toggleSidebar(this.ui.container, this.ui.sidebar, this.ui.resizeHandle, true);

                if (!this.iframeSrcLoaded) {
                    const finalURI = this.matomeCore.getFinalURI(window.location.origin, 'marshalChatURI');
                    this.ui.iframe.src = finalURI;
                    this.iframeSrcLoaded = true;

                    this.ui.iframe.addEventListener('load', () => {
                        const loadingElement = document.getElementById('matome-loading');
                        if (loadingElement) {
                            loadingElement.remove();
                        }
                    });
                }
            } else {
                this.matomeCore.toggleSidebar(this.ui.container, this.ui.sidebar, this.ui.resizeHandle, false);
            }
        },

        setupMarshalSpecificHandling: function () {
            // Add Marshal-specific message handling
            window.addEventListener('message', (event) => {
                if (event.origin !== this.matomeCore.config.matomeBaseURI) {
                    return;
                }

                try {
                    const eventData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                    if (eventData.requestType === "MatomeInsightExpansionRequest") {
                        this.handleInsightExpansionRequest(eventData);
                    }
                } catch (error) {
                    console.error("Error processing Marshal-specific message:", error);
                }
            });
        },

        setupCheckboxObserver: function () {
            const observer = new MutationObserver((mutations) => {
                let shouldAddListeners = false;
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.matches('input[type="checkbox"].awsui-checkbox-native-input') ||
                                    node.querySelector('input[type="checkbox"].awsui-checkbox-native-input')) {
                                    shouldAddListeners = true;
                                }
                            }
                        });
                    }
                });
                if (shouldAddListeners) {
                    this.addListenersToCheckboxes();
                }
            });

            observer.observe(document.body, {childList: true, subtree: true});
        },

        addListenersToCheckboxes: function () {
            const checkboxes = document.querySelectorAll('input[type="checkbox"].awsui-checkbox-native-input');
            checkboxes.forEach(checkbox => {
                if (!checkbox.hasListener) {
                    checkbox.addEventListener('change', this.handleCheckboxChange.bind(this));
                    checkbox.hasListener = true;
                }
            });
        },

        handleCheckboxChange: function () {
            const checkedBoxes = this.getCheckedCheckboxes();
            this.sendInsightMessageToIFrame(checkedBoxes);
        },

        getCheckedCheckboxes: function () {
            const checkedBoxes = [];
            const checkboxes = document.querySelectorAll('input[type="checkbox"].awsui-checkbox-native-input');

            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    const row = checkbox.closest('tr');
                    if (row) {
                        const secondTd = row.querySelector('td:nth-child(2)');
                        if (secondTd) {
                            const link = secondTd.querySelector('a');
                            if (link) {
                                const linkText = link.textContent.trim();
                                checkedBoxes.push({
                                    label: linkText,
                                    href: link.getAttribute('href'),
                                    dismissLabel: `Remove ${linkText}`
                                });
                            }
                        }
                    }
                }
            });

            return checkedBoxes;
        },

        sendInsightMessageToIFrame: function (message) {
            if (this.ui.iframe && this.ui.iframe.contentWindow) {
                this.ui.iframe.contentWindow.postMessage({
                    action: 'InsightLinks',
                    insights: message
                }, this.matomeCore.config.matomeBaseURI);
            }
        },

        handleInsightExpansionRequest: function (eventData) {
            const insights = eventData.insights;
            const reportLink = eventData.report;

            Promise.all([ApiModule.fetchMarshalInsights(insights), ApiModule.fetchMarshalReportSections(reportLink)])
                .then(([insightExpansions, reportSections]) => {
                    if (this.ui.iframe && this.ui.iframe.contentWindow) {
                        this.ui.iframe.contentWindow.postMessage({
                            action: "InsightLinksExpansion",
                            insightData: {insights: insightExpansions, report: reportSections},
                            status: "success"
                        }, this.matomeCore.config.matomeBaseURI);
                    }
                })
                .catch((error) => {
                    console.error("Error processing insights or report:", error);
                    if (this.ui.iframe && this.ui.iframe.contentWindow) {
                        this.ui.iframe.contentWindow.postMessage({
                            action: "InsightLinksExpansion",
                            insightData: {insightExpansions: [], report: []},
                            status: "error"
                        }, this.matomeCore.config.matomeBaseURI);
                    }
                });
        }
    };

    // WorkDocs-specific module
    const WorkDocsModule = {
        init: function (matomeCore) {
            this.matomeCore = matomeCore;
            this.iframeSrcLoaded = false;
            this.waitForNavbar();
        },

        waitForNavbar: function () {
            const observer = new MutationObserver((mutations, obs) => {
                const navbar = document.querySelector('div.MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation0.MuiDrawer-paper.jss6.MuiDrawer-paperAnchorLeft.MuiDrawer-paperAnchorDockedLeft');
                if (navbar) {
                    obs.disconnect();
                    console.log('Side Navbar found');
                    this.setupToggle();
                }
            });

            observer.observe(document.body, {childList: true, subtree: true});
        },

        setupToggle: function () {
            // Create button
            const buttonHtml = `<button class="MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium workdocs-icon jss11 css-1ivdtho" tabindex="0" type="button" aria-label="Apps" id="matomeToggleInput" data-testid="appsMiniMatomeButton" aria-describedby=""><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-vubbuv" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="AppsIcon"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3m-2 10H6V7h12zm-9-6c-.83 0-1.5-.67-1.5-1.5S8.17 10 9 10s1.5.67 1.5 1.5S9.83 13 9 13m7.5-1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5M8 15h8v2H8z"></path></svg></button>`;

            $("div.jss10").append(buttonHtml);

            // Create UI elements
            this.ui = this.matomeCore.createUI('WorkDocs');

            // Setup toggle behavior
            $("#matomeToggleInput").on('click', this.handleToggle.bind(this));

            // Setup message handling
            this.matomeCore.setupMessageHandling(this.ui.iframe);
        },

        handleToggle: function () {
            if (this.ui.sidebar.style.display === 'none') {
                this.matomeCore.toggleSidebar(this.ui.container, this.ui.sidebar, this.ui.resizeHandle, true);

                if (!this.iframeSrcLoaded) {
                    const finalURI = this.matomeCore.getFinalURI(window.location.origin);
                    this.ui.iframe.src = finalURI;
                    this.iframeSrcLoaded = true;

                    this.ui.iframe.addEventListener('load', () => {
                        const loadingElement = document.getElementById('matome-loading');
                        if (loadingElement) {
                            loadingElement.remove();
                        }
                    });
                }
            } else {
                this.matomeCore.toggleSidebar(this.ui.container, this.ui.sidebar, this.ui.resizeHandle, false);
            }
        }
    };

    // Wait for document to be ready
    $(document).ready(function () {
        console.log('Matome: Document ready, initializing with URL:', window.location.href);

        // Initialize site-specific module based on current site
        switch (window.location.origin) {
            case "https://quip-amazon.com":
                QuipModule.init(MatomeCore);
                break;
            case "https://marshal.corp.amazon.com":
                MarshalModule.init(MatomeCore);
                break;
            case "https://amazon.awsapps.com":
                WorkDocsModule.init(MatomeCore);
                break;
            case "https://hire.amazon.com":
            case "https://forte.talent.a2z.com":
            case "https://sim.amazon.com":
            case "https://t.corp.amazon.com":
                // These sites could use similar modules or a generic one
                console.log("Site support not yet implemented in refactored code");
                break;
            default:
                console.log("Unknown site");
        }
    });
})();
