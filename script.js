/**
 * Advanced Calculator Application
 * Supports basic arithmetic, advanced operations, memory functions, and dual input methods
 */

class Calculator {
    constructor() {
        // DOM Elements
        this.display = document.getElementById('display');
        this.operationDisplay = document.getElementById('operation-display');
        
        // Calculator State
        this.currentInput = '0';
        this.previousInput = null;
        this.operator = null;
        this.waitingForNewInput = false;
        this.memory = 0;
        
        // History for complex operations
        this.operationHistory = [];
        
        this.init();
    }

    /**
     * Initialize the calculator by setting up event listeners
     */
    init() {
        this.setupButtonListeners();
        this.setupKeyboardListeners();
        this.updateDisplay();
    }

    /**
     * Set up event listeners for calculator buttons
     */
    setupButtonListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                this.inputNumber(button.dataset.number);
            });
        });

        // Action buttons
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                this.handleAction(button.dataset.action);
            });
        });
    }

    /**
     * Set up keyboard event listeners
     */
    setupKeyboardListeners() {
        document.addEventListener('keydown', (event) => {
            event.preventDefault();
            
            const key = event.key;
            
            // Numbers
            if (key >= '0' && key <= '9') {
                this.inputNumber(key);
            }
            // Decimal point
            else if (key === '.') {
                this.handleAction('decimal');
            }
            // Operators
            else if (key === '+') {
                this.handleAction('add');
            }
            else if (key === '-') {
                this.handleAction('subtract');
            }
            else if (key === '*') {
                this.handleAction('multiply');
            }
            else if (key === '/') {
                this.handleAction('divide');
            }
            // Equals
            else if (key === 'Enter' || key === '=') {
                this.handleAction('equals');
            }
            // Clear
            else if (key === 'Escape' || key === 'c' || key === 'C') {
                this.handleAction('clear');
            }
            // Percentage
            else if (key === '%') {
                this.handleAction('percentage');
            }
            // Backspace (acts as clear for simplicity)
            else if (key === 'Backspace') {
                this.handleAction('clear');
            }
        });
    }

    /**
     * Handle number input
     * @param {string} number - The number to input
     */
    inputNumber(number) {
        if (this.waitingForNewInput) {
            this.currentInput = number;
            this.waitingForNewInput = false;
        } else {
            if (this.currentInput === '0' && number !== '0') {
                this.currentInput = number;
            } else if (this.currentInput !== '0') {
                // Limit input length to prevent display overflow
                if (this.currentInput.length < 12) {
                    this.currentInput += number;
                }
            }
        }
        this.updateDisplay();
    }

    /**
     * Handle various calculator actions
     * @param {string} action - The action to perform
     */
    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'equals':
                this.calculate();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.setOperator(action);
                break;
            case 'percentage':
                this.calculatePercentage();
                break;
            case 'square-root':
                this.calculateSquareRoot();
                break;
            case 'memory-clear':
                this.memoryClear();
                break;
            case 'memory-recall':
                this.memoryRecall();
                break;
            case 'memory-add':
                this.memoryAdd();
                break;
            case 'memory-subtract':
                this.memorySubtract();
                break;
        }
    }

    /**
     * Input decimal point with validation
     */
    inputDecimal() {
        if (this.waitingForNewInput) {
            this.currentInput = '0.';
            this.waitingForNewInput = false;
        } else if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
        this.updateDisplay();
    }

    /**
     * Set the current operator and prepare for next input
     * @param {string} newOperator - The operator to set
     */
    setOperator(newOperator) {
        if (this.operator && !this.waitingForNewInput) {
            this.calculate();
        }

        this.operator = newOperator;
        this.previousInput = this.currentInput;
        this.waitingForNewInput = true;
        
        // Update operation display
        const operatorSymbols = {
            'add': '+',
            'subtract': '-',
            'multiply': '×',
            'divide': '÷'
        };
        
        this.operationDisplay.textContent = `${this.previousInput} ${operatorSymbols[newOperator]}`;
        
        // Visual feedback for active operator
        this.updateOperatorButtons(newOperator);
    }

    /**
     * Update visual state of operator buttons
     * @param {string} activeOperator - The currently active operator
     */
    updateOperatorButtons(activeOperator) {
        // Remove active class from all operator buttons
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to current operator button
        const activeButton = document.querySelector(`[data-action="${activeOperator}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    /**
     * Perform calculation based on current operator
     */
    calculate() {
        if (!this.operator || this.previousInput === null) {
            return;
        }

        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        let result;

        // Perform calculation based on operator
        switch (this.operator) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        // Update operation history for display
        const operatorSymbols = {
            'add': '+',
            'subtract': '-',
            'multiply': '×',
            'divide': '÷'
        };
        
        this.operationDisplay.textContent = `${this.previousInput} ${operatorSymbols[this.operator]} ${this.currentInput} =`;

        // Format and set result
        this.currentInput = this.formatResult(result);
        this.operator = null;
        this.previousInput = null;
        this.waitingForNewInput = true;
        
        // Clear active operator styling
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        this.updateDisplay();
    }

    /**
     * Calculate percentage of current input
     */
    calculatePercentage() {
        const current = parseFloat(this.currentInput);
        const result = current / 100;
        
        this.operationDisplay.textContent = `${this.currentInput}% =`;
        this.currentInput = this.formatResult(result);
        this.waitingForNewInput = true;
        this.updateDisplay();
    }

    /**
     * Calculate square root of current input
     */
    calculateSquareRoot() {
        const current = parseFloat(this.currentInput);
        
        if (current < 0) {
            this.showError('Invalid input for square root');
            return;
        }
        
        const result = Math.sqrt(current);
        this.operationDisplay.textContent = `√${this.currentInput} =`;
        this.currentInput = this.formatResult(result);
        this.waitingForNewInput = true;
        this.updateDisplay();
    }

    /**
     * Clear memory
     */
    memoryClear() {
        this.memory = 0;
        this.showTemporaryMessage('Memory cleared');
    }

    /**
     * Recall value from memory
     */
    memoryRecall() {
        this.currentInput = this.formatResult(this.memory);
        this.waitingForNewInput = true;
        this.updateDisplay();
        this.showTemporaryMessage('Memory recalled');
    }

    /**
     * Add current input to memory
     */
    memoryAdd() {
        const current = parseFloat(this.currentInput);
        this.memory += current;
        this.showTemporaryMessage('Added to memory');
    }

    /**
     * Subtract current input from memory
     */
    memorySubtract() {
        const current = parseFloat(this.currentInput);
        this.memory -= current;
        this.showTemporaryMessage('Subtracted from memory');
    }

    /**
     * Clear all calculator state
     */
    clear() {
        this.currentInput = '0';
        this.previousInput = null;
        this.operator = null;
        this.waitingForNewInput = false;
        this.operationDisplay.textContent = '';
        
        // Clear active operator styling
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Clear error state
        this.display.classList.remove('error');
        
        this.updateDisplay();
    }

    /**
     * Format calculation result for display
     * @param {number} result - The result to format
     * @returns {string} - Formatted result
     */
    formatResult(result) {
        // Handle special cases
        if (!isFinite(result)) {
            return 'Error';
        }
        
        // Convert to string and handle precision
        let formatted = result.toString();
        
        // Handle very large or very small numbers with scientific notation
        if (Math.abs(result) >= 1e12 || (Math.abs(result) <= 1e-6 && result !== 0)) {
            formatted = result.toExponential(6);
        } else {
            // Limit decimal places for display
            const decimalPlaces = formatted.includes('.') ? formatted.split('.')[1].length : 0;
            if (decimalPlaces > 8) {
                formatted = result.toFixed(8);
                // Remove trailing zeros
                formatted = formatted.replace(/\.?0+$/, '');
            }
        }
        
        // Ensure the result fits in the display
        if (formatted.length > 12) {
            formatted = result.toExponential(5);
        }
        
        return formatted;
    }

    /**
     * Show error message in display
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.display.textContent = message;
        this.display.classList.add('error');
        this.operationDisplay.textContent = '';
        
        // Reset after 2 seconds
        setTimeout(() => {
            this.clear();
        }, 2000);
    }

    /**
     * Show temporary message in operation display
     * @param {string} message - Message to display
     */
    showTemporaryMessage(message) {
        const originalText = this.operationDisplay.textContent;
        this.operationDisplay.textContent = message;
        
        setTimeout(() => {
            this.operationDisplay.textContent = originalText;
        }, 1500);
    }

    /**
     * Update the display with current input
     */
    updateDisplay() {
        this.display.textContent = this.currentInput;
        this.display.classList.remove('error');
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// Service Worker registration for offline functionality (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
