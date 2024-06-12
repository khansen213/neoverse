document.addEventListener('DOMContentLoaded', () => {
    const scrollMenu = document.getElementById('scrollMenu');
    const infoTable = document.getElementById('infoTable').querySelector('tbody');
    const particleInfo = document.getElementById('particleInfo');
    const fakeTableContainer = document.getElementById('fakeTableContainer');
    const particleTitle = document.getElementById('particleTitle');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    const copyAllButton = document.getElementById('copyAllButton');
    const searchInput = document.getElementById('searchInput');
    const sortAZButton = document.getElementById('sortAZButton');
    const sortZAButton = document.getElementById('sortZAButton');
    const sortHeavyButton = document.getElementById('sortHeavyButton');
    const sortLightButton = document.getElementById('sortLightButton');
    const nameHeader = document.getElementById('nameHeader');
    const valueHeader = document.getElementById('valueHeader');
    const redDot = document.querySelector('.red-dot');
    const yellowDot = document.querySelector('.yellow-dot');
    const greenDot = document.querySelector('.green-dot');
    const hamburgerMenu = document.querySelector('.hamburger-icon');
    const categoryButtons = document.getElementById('categoryButtons');
    const valueSlider = document.getElementById('valueSlider');
    const sliderContainer = document.getElementById('sliderContainer');
    const container = document.querySelector('.container');
    const scrollMenuElement = document.querySelector('.scroll-menu');

    redDot.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    yellowDot.addEventListener('click', () => {
        container.style.width = '90%';
        container.style.height = '80vh';
        container.style.padding = '';
        container.style.margin = '';
        container.style.maxWidth = '1200px';
        container.style.borderTopLeftRadius = '20px';
        container.style.borderBottomRightRadius = '20px';
        scrollMenuElement.style.borderTopLeftRadius = '20px';
        scrollMenuElement.style.borderBottomLeftRadius = '20px';
    });

    greenDot.addEventListener('click', () => {
        container.style.width = '100%';
        container.style.height = '100vh';
        container.style.padding = '0';
        container.style.margin = '0';
        container.style.maxWidth = '100%';
        container.style.borderTopLeftRadius = '0';
        container.style.borderBottomRightRadius = '0';
        scrollMenuElement.style.borderTopLeftRadius = '0';
        scrollMenuElement.style.borderBottomLeftRadius = '0';
    });

    hamburgerMenu.addEventListener('click', () => {
        categoryButtons.classList.toggle('hidden');
        hamburgerMenu.classList.toggle('open');
        if (categoryButtons.classList.contains('hidden')) {
            copyAllButton.classList.remove('hidden');
        } else {
            copyAllButton.classList.add('hidden');
        }
    });

    // Category buttons
    const categoryButtonsMap = {
        sauzeButton: 'Sauze (T)',
        gravsButton: 'Gravs (A)',
        changeRateButton: 'Change Rate',
        ennumsButton: 'Ennums',
        negatronsButton: 'Negatrons',
        positronsButton: 'Positrons',
        tempotronsButton: 'Tempotrons',
        neutronsButton: 'Neutrons',
        statictronsButton: 'Statictrons',
        electronsButton: 'Electrons',
        ambientsButton: 'Ambients',
        matterTypeButton: 'Matter Type',
        typeMatterTypeButton: 'Type of Matter Type',
        subchargeButton: 'Subcharge'
    };

    let currentSortOrder = {
        name: 'asc',
        value: 'desc'
    };

    // Function to load JSON data
    function loadJSON(callback) {
        const xhr = new XMLHttpRequest();
        xhr.overrideMimeType("application/json");
        xhr.open('GET', 'neoverse_elements.json', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(JSON.parse(xhr.responseText));
            }
        };
        xhr.send(null);
    }

    // Populate the menu with particle names
    loadJSON(function (particleData) {
        function createMenuItems(data) {
            scrollMenu.querySelectorAll('.menu-item').forEach(item => item.remove());
            Object.keys(data).forEach(particle => {
                Object.keys(data[particle]).forEach(type => {
                    const menuItem = document.createElement('div');
                    menuItem.classList.add('menu-item');
                    menuItem.setAttribute('data-particle', particle);
                    menuItem.setAttribute('data-type', type);
                    menuItem.textContent = `${particle}`;
                    menuItem.title = particle;
                    scrollMenu.appendChild(menuItem);
                });
            });
        }

        createMenuItems(particleData);

        function sortMenuItems(comparator) {
            const items = Array.from(scrollMenu.querySelectorAll('.menu-item'));
            items.sort(comparator);
            items.forEach(item => scrollMenu.appendChild(item));
        }

        sortAZButton.addEventListener('click', () => {
            sortMenuItems((a, b) => a.title.localeCompare(b.title));
        });

        sortZAButton.addEventListener('click', () => {
            sortMenuItems((a, b) => b.title.localeCompare(a.title));
        });

        sortHeavyButton.addEventListener('click', () => {
            sortMenuItems((a, b) => {
                const particleA = particleData[a.getAttribute('data-particle')][a.getAttribute('data-type')][0];
                const particleB = particleData[b.getAttribute('data-particle')][a.getAttribute('data-type')][0];
                return particleB['Sauze T'] - particleA['Sauze T'];
            });
        });

        sortLightButton.addEventListener('click', () => {
            sortMenuItems((a, b) => {
                const particleA = particleData[a.getAttribute('data-particle')][a.getAttribute('data-type')][0];
                const particleB = particleData[b.getAttribute('data-particle')][a.getAttribute('data-type')][0];
                return particleA['Sauze T'] - particleB['Sauze T'];
            });
        });

        searchInput.addEventListener('input', () => {
            const searchValue = searchInput.value.toLowerCase();
            scrollMenu.querySelectorAll('.menu-item').forEach(item => {
                const particle = item.getAttribute('data-particle').toLowerCase();
                if (particle.includes(searchValue)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });

        // Event listener for menu items
        scrollMenu.addEventListener('click', (event) => {
            if (event.target.classList.contains('menu-item')) {
                const particle = event.target.getAttribute('data-particle');
                const type = event.target.getAttribute('data-type');
                const data = particleData[particle][type][0];

                if (data) {
                    const rows = Object.entries(data).map(([key, value]) => `
                        <tr>
                            <th>${key}</th>
                            <td>${value}</td>
                        </tr>
                    `).join('');

                    infoTable.innerHTML = rows;
                    particleTitle.textContent = `${particle} Information`;
                    particleInfo.classList.remove('hidden');
                    particleInfo.classList.add('fade-in');
                    fakeTableContainer.classList.add('hidden');
                    copyAllButton.classList.add('active');
                    copyAllButton.classList.remove('hidden');
                }
            }
        });

        // Event listener for category buttons
        Object.keys(categoryButtonsMap).forEach(buttonId => {
            document.getElementById(buttonId).addEventListener('click', () => {
                const category = categoryButtonsMap[buttonId];
                const rows = [];
                const distinctValues = new Set();
                Object.keys(particleData).forEach(particle => {
                    Object.keys(particleData[particle]).forEach(type => {
                        const data = particleData[particle][type][0];
                        if (data[category] !== undefined) {
                            rows.push({
                                particle,
                                value: data[category]
                            });
                            distinctValues.add(data[category]);
                        }
                    });
                });

                if (rows.length > 0) {
                    rows.sort((a, b) => a.particle.localeCompare(b.particle));
                    infoTable.innerHTML = rows.map(row => `
                        <tr>
                            <td>${row.particle}</td>
                            <td>${row.value}</td>
                        </tr>
                    `).join('');
                    particleTitle.textContent = `All ${category}`;
                    document.querySelector('thead').classList.remove('hidden');
                    particleInfo.classList.remove('hidden');
                    particleInfo.classList.add('fade-in');
                    fakeTableContainer.classList.add('hidden');
                    copyAllButton.classList.add('active');
                    copyAllButton.classList.remove('hidden');
                    categoryButtons.classList.add('hidden');
                    hamburgerMenu.classList.remove('open');

                    if (distinctValues.size > 1 && distinctValues.size <= 5) {
                        const distinctArray = Array.from(distinctValues);
                        sliderContainer.classList.remove('hidden');
                        valueSlider.max = distinctArray.length - 1;
                        valueSlider.oninput = () => {
                            const filteredRows = rows.filter(row => row.value === distinctArray[valueSlider.value]);
                            infoTable.innerHTML = filteredRows.map(row => `
                                <tr>
                                    <td>${row.particle}</td>
                                    <td>${row.value}</td>
                                </tr>
                            `).join('');
                        };
                    } else {
                        sliderContainer.classList.add('hidden');
                    }
                }
            });
        });

        // Sort by name and value headers
        function sortTableByName(order) {
            const rows = Array.from(infoTable.querySelectorAll('tr'));
            rows.sort((a, b) => {
                const nameA = a.querySelector('td').textContent;
                const nameB = b.querySelector('td').textContent;
                return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            });
            infoTable.innerHTML = rows.map(row => row.outerHTML).join('');
        }

        function sortTableByValue(order) {
            const rows = Array.from(infoTable.querySelectorAll('tr'));
            rows.sort((a, b) => {
                const valueA = a.querySelectorAll('td')[1].textContent;
                const valueB = b.querySelectorAll('td')[1].textContent;
                const numA = parseFloat(valueA);
                const numB = parseFloat(valueB);

                if (!isNaN(numA) && !isNaN(numB)) {
                    return order === 'asc' ? numA - numB : numB - numA;
                } else if (valueA.match(/[a-zA-Z]/) && valueB.match(/[a-zA-Z]/)) {
                    return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
                } else if (valueA.match(/[a-zA-Z]/)) {
                    return order === 'asc' ? -1 : 1;
                } else if (valueB.match(/[a-zA-Z]/)) {
                    return order === 'asc' ? 1 : -1;
                } else {
                    return 0;
                }
            });
            infoTable.innerHTML = rows.map(row => row.outerHTML).join('');
        }

        nameHeader.addEventListener('click', () => {
            currentSortOrder.name = currentSortOrder.name === 'asc' ? 'desc' : 'asc';
            sortTableByName(currentSortOrder.name);
        });

        valueHeader.addEventListener('click', () => {
            currentSortOrder.value = currentSortOrder.value === 'asc' ? 'desc' : 'asc';
            sortTableByValue(currentSortOrder.value);
        });

        // Function to show notification
        function showNotification(message, isSuccess = true) {
            notificationText.textContent = message;
            notification.classList.remove('hidden', 'success', 'error');
            notification.classList.add(isSuccess ? 'success' : 'error');
            notification.classList.add('show');

            setTimeout(() => {
                notification.classList.remove('show');
                notification.classList.add('fade-out');
            }, 2000);

            setTimeout(() => {
                notification.classList.add('hidden');
                notification.classList.remove('fade-out');
            }, 2500);
        }

        // Copy to clipboard and show notification
        infoTable.addEventListener('click', (event) => {
            if (event.target.tagName === 'TD') {
                const text = event.target.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    showNotification(`"${text}" copied to clipboard.`);
                }).catch(() => {
                    showNotification('Failed to copy text.', false);
                });
            }
        });

        // Copy all table info to clipboard
        copyAllButton.addEventListener('click', () => {
            const text = infoTable.innerText;
            navigator.clipboard.writeText(text).then(() => {
                showNotification('All information copied to clipboard.');
            }).catch(() => {
                showNotification('Failed to copy all information.', false);
            });
        });
    });
});
