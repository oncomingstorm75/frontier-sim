// js/utils.js - Complete Utility Functions for Frontier Simulation

/**
 * Random number and choice utilities
 */
const Random = {
    // Generate random integer between min and max (inclusive)
    int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    // Generate random float between min and max
    float: (min, max) => Math.random() * (max - min) + min,
    
    // Return true with given probability (0.0 to 1.0)
    chance: (probability) => Math.random() < probability,
    
    // Choose random element from array
    choice: (array) => {
        if (!Array.isArray(array) || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    },
    
    // Choose multiple random elements from array (without replacement)
    choices: (array, count) => {
        if (!Array.isArray(array) || count <= 0) return [];
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, array.length));
    },
    
    // Weighted random choice from object {key: weight, ...}
    weightedChoice: (weights) => {
        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        if (totalWeight <= 0) return Object.keys(weights)[0] || null;
        
        let random = Math.random() * totalWeight;
        
        for (const [key, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) return key;
        }
        return Object.keys(weights)[0];
    },
    
    // Generate random boolean
    bool: () => Math.random() < 0.5,
    
    // Pick random property from object
    property: (obj) => {
        const keys = Object.keys(obj);
        return keys.length > 0 ? obj[Random.choice(keys)] : null;
    },
    
    // Generate random string of given length
    string: (length, chars = 'abcdefghijklmnopqrstuvwxyz') => {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    // Shuffle array in place
    shuffle: (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    
    // Normal distribution (Box-Muller transform)
    normal: (mean = 0, stdDev = 1) => {
        let u = 0, v = 0;
        while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z * stdDev + mean;
    }
};

/**
 * Date and time utilities
 */
const DateUtils = {
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'],
    seasonNames: ['Winter', 'Spring', 'Summer', 'Fall'],
    daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    
    // Check if year is leap year
    isLeapYear: (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0),
    
    // Get days in month for given year
    getDaysInMonth: (month, year) => {
        if (month === 1 && DateUtils.isLeapYear(year)) return 29;
        return DateUtils.daysInMonth[month];
    },
    
    // Get season from date object or month number
    getSeason: (date) => {
        const month = typeof date === 'object' ? date.getMonth() : date;
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    },
    
    // Format date object to readable string
    formatDate: (date) => {
        if (!date) return 'Unknown Date';
        const month = date.getMonth();
        const day = date.getDate();
        const year = date.getFullYear();
        return `${DateUtils.monthNames[month]} ${day}, ${year}`;
    },
    
    // Format date object to short string
    formatDateShort: (date) => {
        if (!date) return 'Unknown';
        const month = date.getMonth();
        const day = date.getDate();
        return `${DateUtils.monthNames[month].substring(0, 3)} ${day}`;
    },
    
    // Add days to date
    addDays: (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    
    // Calculate days between two dates
    daysBetween: (date1, date2) => {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((date1 - date2) / oneDay));
    },
    
    // Get day of year (1-366)
    getDayOfYear: (date) => {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    },
    
    // Get week of year
    getWeekOfYear: (date) => {
        const oneJan = new Date(date.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
        return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
    }
};

/**
 * Weather generation system
 */
const WeatherGenerator = {
    // Generate weather for given date and season
    generateWeather: (date, season) => {
        const seasonalData = WeatherGenerator.getSeasonalData(season);
        
        // Base temperature with daily variation
        const baseTemp = Random.int(seasonalData.tempRange.min, seasonalData.tempRange.max);
        const dailyVariation = Random.int(-5, 5);
        const temperature = baseTemp + dailyVariation;
        
        // Precipitation
        const precipChance = seasonalData.precipitationChance;
        const precipitation = Random.chance(precipChance) ? 
            Random.choice(seasonalData.precipitationTypes) : 'none';
        
        // Wind
        const windSpeed = Random.int(0, 25);
        const windDirection = Random.choice(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']);
        
        // Special conditions
        let conditions = [];
        if (temperature < -10) conditions.push('bitter_cold');
        if (temperature > 35) conditions.push('extreme_heat');
        if (windSpeed > 20) conditions.push('high_winds');
        if (Random.chance(0.05)) conditions.push('dust_storm');
        
        return {
            temperature,
            precipitation,
            windSpeed,
            windDirection,
            conditions,
            season,
            description: WeatherGenerator.generateDescription(temperature, precipitation, windSpeed, conditions)
        };
    },
    
    getSeasonalData: (season) => {
        const data = {
            spring: {
                tempRange: { min: 5, max: 20 },
                precipitationChance: 0.4,
                precipitationTypes: ['light_rain', 'heavy_rain', 'drizzle']
            },
            summer: {
                tempRange: { min: 15, max: 35 },
                precipitationChance: 0.2,
                precipitationTypes: ['thunderstorm', 'light_rain', 'heavy_rain']
            },
            fall: {
                tempRange: { min: 0, max: 15 },
                precipitationChance: 0.3,
                precipitationTypes: ['light_rain', 'heavy_rain', 'sleet']
            },
            winter: {
                tempRange: { min: -10, max: 5 },
                precipitationChance: 0.5,
                precipitationTypes: ['snow', 'heavy_snow', 'sleet', 'freezing_rain']
            }
        };
        return data[season] || data.spring;
    },
    
    generateDescription: (temp, precip, wind, conditions) => {
        let desc = [];
        
        // Temperature description
        if (temp < -5) desc.push('bitter cold');
        else if (temp < 5) desc.push('cold');
        else if (temp < 15) desc.push('cool');
        else if (temp < 25) desc.push('mild');
        else if (temp < 30) desc.push('warm');
        else desc.push('hot');
        
        // Precipitation
        if (precip !== 'none') {
            const precipDesc = {
                'light_rain': 'light rain',
                'heavy_rain': 'heavy rain',
                'drizzle': 'drizzle',
                'thunderstorm': 'thunderstorm',
                'snow': 'snow',
                'heavy_snow': 'heavy snow',
                'sleet': 'sleet',
                'freezing_rain': 'freezing rain'
            };
            desc.push(precipDesc[precip] || precip);
        }
        
        // Wind
        if (wind > 15) desc.push('windy');
        
        // Special conditions
        conditions.forEach(condition => {
            if (condition === 'dust_storm') desc.push('dust storm');
            if (condition === 'high_winds') desc.push('high winds');
        });
        
        return desc.join(', ') || 'clear';
    }
};

/**
 * Economic and market utilities
 */
const EconomyGenerator = {
    // Generate base market prices
    generateMarketPrices: () => {
        return {
            food: Random.float(0.5, 2.0),
            water: Random.float(0.1, 0.5),
            wood: Random.float(0.3, 1.5),
            stone: Random.float(0.2, 1.0),
            metal: Random.float(2.0, 8.0),
            tools: Random.float(5.0, 20.0),
            medicine: Random.float(3.0, 15.0),
            ammunition: Random.float(1.0, 5.0),
            luxury_goods: Random.float(10.0, 50.0)
        };
    },
    
    // Calculate supply/demand effects on prices
    adjustPrices: (prices, supply, demand) => {
        const adjusted = { ...prices };
        
        Object.keys(adjusted).forEach(resource => {
            const supplyLevel = supply[resource] || 0;
            const demandLevel = demand[resource] || 0;
            
            // Simple supply/demand calculation
            if (demandLevel > supplyLevel * 2) {
                adjusted[resource] *= 1.5; // High demand, low supply
            } else if (supplyLevel > demandLevel * 2) {
                adjusted[resource] *= 0.7; // Low demand, high supply
            }
            
            // Add some randomness
            adjusted[resource] *= Random.float(0.9, 1.1);
            
            // Ensure minimum price
            adjusted[resource] = Math.max(0.1, adjusted[resource]);
        });
        
        return adjusted;
    },
    
    // Generate trade opportunity
    generateTradeOpportunity: () => {
        const traders = ['Mexican Merchants', 'Eastern Suppliers', 'Native Traders', 'Mountain Men'];
        const tradeGoods = {
            offering: Random.choice(['cattle', 'horses', 'exotic_goods', 'weapons', 'tools']),
            wanting: Random.choice(['gold', 'food', 'lumber', 'furs', 'information']),
            trader: Random.choice(traders),
            duration: Random.int(3, 10), // days available
            quality: Random.choice(['poor', 'fair', 'good', 'excellent'])
        };
        
        return tradeGoods;
    }
};

/**
 * Text and narrative utilities
 */
const TextUtils = {
    // Capitalize first letter
    capitalize: (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    // Title case
    titleCase: (str) => {
        if (!str) return '';
        return str.split(' ').map(TextUtils.capitalize).join(' ');
    },
    
    // Generate possessive form
    possessive: (name) => {
        if (!name) return '';
        return name.endsWith('s') ? `${name}'` : `${name}'s`;
    },
    
    // Choose appropriate article (a/an)
    article: (word) => {
        if (!word) return 'a';
        return /^[aeiouAEIOU]/.test(word) ? 'an' : 'a';
    },
    
    // Pluralize simple nouns
    pluralize: (word, count) => {
        if (!word || count === 1) return word;
        if (word.endsWith('y')) return word.slice(0, -1) + 'ies';
        if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch')) return word + 'es';
        return word + 's';
    },
    
    // Insert variables into template string
    template: (template, variables) => {
        if (!template) return '';
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return variables.hasOwnProperty(key) ? variables[key] : match;
        });
    },
    
    // Join array with proper grammar
    joinWithAnd: (items) => {
        if (!Array.isArray(items) || items.length === 0) return '';
        if (items.length === 1) return items[0];
        if (items.length === 2) return `${items[0]} and ${items[1]}`;
        return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
    },
    
    // Generate random frontier names
    generateLocationName: () => {
        const adjectives = ['Red', 'Blue', 'Black', 'White', 'Silver', 'Golden', 'Dead', 'Wild', 'Lost', 'Hidden'];
        const nouns = ['Rock', 'Creek', 'Valley', 'Canyon', 'Ridge', 'Peak', 'Springs', 'Gulch', 'Pass', 'Mesa'];
        return `${Random.choice(adjectives)} ${Random.choice(nouns)}`;
    },
    
    // Generate frontier business names
    generateBusinessName: () => {
        const prefixes = ['Pioneer', 'Frontier', 'Gold Rush', 'Silver Dollar', 'Red Rock', 'Trail\'s End'];
        const suffixes = ['Saloon', 'General Store', 'Trading Post', 'Supply Co.', 'Outfitters'];
        return `${Random.choice(prefixes)} ${Random.choice(suffixes)}`;
    }
};

/**
 * Mathematical and statistical utilities
 */
const MathUtils = {
    // Clamp value between min and max
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
    
    // Linear interpolation
    lerp: (start, end, factor) => start + (end - start) * factor,
    
    // Map value from one range to another
    map: (value, inMin, inMax, outMin, outMax) => {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },
    
    // Calculate average
    average: (numbers) => {
        if (!Array.isArray(numbers) || numbers.length === 0) return 0;
        return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    },
    
    // Calculate median
    median: (numbers) => {
        if (!Array.isArray(numbers) || numbers.length === 0) return 0;
        const sorted = [...numbers].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? 
            (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    },
    
    // Calculate standard deviation
    standardDeviation: (numbers) => {
        if (!Array.isArray(numbers) || numbers.length === 0) return 0;
        const avg = MathUtils.average(numbers);
        const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2));
        return Math.sqrt(MathUtils.average(squaredDiffs));
    },
    
    // Weighted average
    weightedAverage: (values, weights) => {
        if (!Array.isArray(values) || !Array.isArray(weights)) return 0;
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        if (totalWeight === 0) return 0;
        const weightedSum = values.reduce((sum, value, i) => sum + value * (weights[i] || 0), 0);
        return weightedSum / totalWeight;
    },
    
    // Distance between two points
    distance: (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
    
    // Sigmoid function for smooth transitions
    sigmoid: (x) => 1 / (1 + Math.exp(-x)),
    
    // Ease in/out function
    easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    
    // Percentage calculation
    percentage: (part, whole) => whole === 0 ? 0 : (part / whole) * 100,
    
    // Round to specific decimal places
    round: (num, decimals = 0) => {
        const factor = Math.pow(10, decimals);
        return Math.round(num * factor) / factor;
    }
};

/**
 * Performance and optimization utilities
 */
const Performance = {
    // Simple timer for measuring performance
    timer: () => {
        const start = performance.now();
        return {
            stop: () => performance.now() - start,
            elapsed: () => performance.now() - start
        };
    },
    
    // Throttle function calls
    throttle: (func, delay) => {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    },
    
    // Debounce function calls
    debounce: (func, delay) => {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    // Simple object pooling
    objectPool: (createFn, resetFn) => {
        const pool = [];
        return {
            get: () => pool.length > 0 ? pool.pop() : createFn(),
            release: (obj) => {
                if (resetFn) resetFn(obj);
                pool.push(obj);
            },
            size: () => pool.length
        };
    }
};

/**
 * Array and object utilities
 */
const CollectionUtils = {
    // Group array elements by key
    groupBy: (array, keyFn) => {
        return array.reduce((groups, item) => {
            const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
            groups[key] = groups[key] || [];
            groups[key].push(item);
            return groups;
        }, {});
    },
    
    // Remove duplicates from array
    unique: (array, keyFn) => {
        if (!keyFn) return [...new Set(array)];
        const seen = new Set();
        return array.filter(item => {
            const key = keyFn(item);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    },
    
    // Find max/min by property
    maxBy: (array, keyFn) => {
        if (array.length === 0) return null;
        return array.reduce((max, item) => 
            keyFn(item) > keyFn(max) ? item : max
        );
    },
    
    minBy: (array, keyFn) => {
        if (array.length === 0) return null;
        return array.reduce((min, item) => 
            keyFn(item) < keyFn(min) ? item : min
        );
    },
    
    // Deep clone object
    deepClone: (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => CollectionUtils.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = CollectionUtils.deepClone(obj[key]);
            });
            return cloned;
        }
        return obj;
    },
    
    // Merge objects deeply
    deepMerge: (target, source) => {
        const result = { ...target };
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = CollectionUtils.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        });
        return result;
    }
};

// Export all utilities as a single object
window.FrontierUtils = {
    Random,
    DateUtils,
    WeatherGenerator,
    EconomyGenerator,
    TextUtils,
    MathUtils,
    Performance,
    CollectionUtils
};

// For Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.FrontierUtils;
}