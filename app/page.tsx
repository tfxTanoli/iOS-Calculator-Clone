'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForValue: boolean;
  memory: number;
}

const Calculator: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForValue: false,
    memory: 0,
  });

  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState('3rem');
  const [minHeight, setMinHeight] = useState('3rem');

  // Format number with commas and handle decimals
  const formatNumber = (num: string): string => {
    if (num === '0') return '0';
    
    const parts = num.split('.');
    const integerPart = parts[0];
    
    // Add commas to integer part
    const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Add decimal part if exists
    return parts[1] !== undefined ? `${formatted}.${parts[1]}` : formatted;
  };

  // Remove commas for calculations
  const parseNumber = (str: string): number => {
    return parseFloat(str.replace(/,/g, ''));
  };

  // Handle number input
  const inputNumber = (num: string) => {
    setState(prevState => {
      if (prevState.waitingForValue) {
        return {
          ...prevState,
          display: num,
          waitingForValue: false,
        };
      }
      
      if (prevState.display === '0') {
        return {
          ...prevState,
          display: num,
        };
      }
      
      // Limit display length
      if (prevState.display.replace(/,/g, '').length >= 9) {
        return prevState;
      }
      
      return {
        ...prevState,
        display: prevState.display + num,
      };
    });
  };

  // Handle decimal input
  const inputDecimal = () => {
    setState(prevState => {
      if (prevState.waitingForValue) {
        return {
          ...prevState,
          display: '0.',
          waitingForValue: false,
        };
      }
      
      if (prevState.display.indexOf('.') === -1) {
        return {
          ...prevState,
          display: prevState.display + '.',
        };
      }
      
      return prevState;
    });
  };

  // Clear function
  const clear = () => {
    setState({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForValue: false,
      memory: 0,
    });
  };

  // Toggle sign
  const toggleSign = () => {
    setState(prevState => {
      const current = parseNumber(prevState.display);
      if (current === 0) return prevState;
      
      const newValue = current * -1;
      return {
        ...prevState,
        display: formatNumber(newValue.toString()),
      };
    });
  };

  // Percentage function
  const percentage = () => {
    setState(prevState => {
      const current = parseNumber(prevState.display);
      const newValue = current / 100;
      return {
        ...prevState,
        display: formatNumber(newValue.toString()),
      };
    });
  };

  // Perform calculation
  const calculate = useCallback(() => {
    setState(prevState => {
      if (prevState.operation && prevState.previousValue !== null) {
        const prev = prevState.previousValue;
        const current = parseNumber(prevState.display);
        let result: number;

        switch (prevState.operation) {
          case '+':
            result = prev + current;
            break;
          case '-':
            result = prev - current;
            break;
          case '×':
            result = prev * current;
            break;
          case '÷':
            if (current === 0) {
              return {
                ...prevState,
                display: 'Error',
                previousValue: null,
                operation: null,
                waitingForValue: true,
              };
            }
            result = prev / current;
            break;
          default:
            return prevState;
        }

        // Handle very large numbers
        if (Math.abs(result) > 999999999) {
          return {
            ...prevState,
            display: result.toExponential(2),
            previousValue: null,
            operation: null,
            waitingForValue: true,
          };
        }

        // Round to avoid floating point errors
        result = Math.round(result * 100000000) / 100000000;

        return {
          ...prevState,
          display: formatNumber(result.toString()),
          previousValue: null,
          operation: null,
          waitingForValue: true,
        };
      }
      return prevState;
    });
  }, []);

  // Handle operation input
  const inputOperation = (op: string) => {
    setState(prevState => {
      if (prevState.previousValue !== null && prevState.operation && !prevState.waitingForValue) {
        // Chain operations
        const prev = prevState.previousValue;
        const current = parseNumber(prevState.display);
        let result: number;

        switch (prevState.operation) {
          case '+':
            result = prev + current;
            break;
          case '-':
            result = prev - current;
            break;
          case '×':
            result = prev * current;
            break;
          case '÷':
            if (current === 0) {
              return {
                ...prevState,
                display: 'Error',
                previousValue: null,
                operation: null,
                waitingForValue: true,
              };
            }
            result = prev / current;
            break;
          default:
            result = current;
        }

        result = Math.round(result * 100000000) / 100000000;

        return {
          ...prevState,
          display: formatNumber(result.toString()),
          previousValue: result,
          operation: op,
          waitingForValue: true,
        };
      }

      return {
        ...prevState,
        previousValue: parseNumber(prevState.display),
        operation: op,
        waitingForValue: true,
      };
    });
  };

  // Button press animation
  const handleButtonPress = (value: string) => {
    setPressedButton(value);
    setTimeout(() => setPressedButton(null), 100);
  };

  // Update font size based on display length and window width
  const updateDisplaySize = useCallback(() => {
    if (typeof window !== 'undefined') {
      const isSmallScreen = window.innerWidth < 640;
      const displayLength = state.display.length;
      
      if (displayLength > 6) {
        setFontSize(isSmallScreen ? '2rem' : '2.5rem');
        setMinHeight(isSmallScreen ? '2rem' : '2.5rem');
      } else {
        setFontSize(isSmallScreen ? '2.5rem' : '3rem');
        setMinHeight(isSmallScreen ? '2.5rem' : '3rem');
      }
    }
  }, [state.display]);

  // Handle window resize and display changes
  useEffect(() => {
    updateDisplaySize();
    
    const handleResize = () => {
      updateDisplaySize();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [updateDisplaySize]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      
      if (key >= '0' && key <= '9') {
        handleButtonPress(key);
        inputNumber(key);
      } else if (key === '.') {
        handleButtonPress('.');
        inputDecimal();
      } else if (key === '+') {
        handleButtonPress('+');
        inputOperation('+');
      } else if (key === '-') {
        handleButtonPress('-');
        inputOperation('-');
      } else if (key === '*') {
        handleButtonPress('×');
        inputOperation('×');
      } else if (key === '/') {
        event.preventDefault();
        handleButtonPress('÷');
        inputOperation('÷');
      } else if (key === '=' || key === 'Enter') {
        event.preventDefault();
        handleButtonPress('=');
        calculate();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        handleButtonPress('C');
        clear();
      } else if (key === '%') {
        handleButtonPress('%');
        percentage();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [calculate]);

  // Button component
  const Button: React.FC<{
    value: string;
    onClick: () => void;
    className: string;
    span?: boolean;
  }> = ({ value, onClick, className, span = false }) => {
    const isPressed = pressedButton === value;
    
    return (
      <button
        className={`
          ${className}
          ${span ? 'col-span-2' : ''}
          rounded-full font-light h-14 w-14 sm:h-16 sm:w-16 md:h-18 md:w-18
          ${span ? 'w-32 sm:w-36 md:w-40' : ''}
          text-xl sm:text-2xl md:text-3xl
          transition-all duration-75 ease-out
          ${isPressed ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}
          active:scale-95 active:opacity-80
          focus:outline-none
        `}
        onClick={() => {
          handleButtonPress(value);
          onClick();
        }}
      >
        {value}
      </button>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-2 sm:p-4">
      <div className="w-full max-w-xs sm:max-w-sm mx-auto">
        {/* Display */}
        <div className="bg-black mb-3 sm:mb-4 text-right px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          <div 
            className="text-white font-thin tracking-tight leading-none overflow-hidden"
            style={{ 
              fontSize: fontSize,
              minHeight: minHeight
            }}
          >
            {formatNumber(state.display)}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 px-2 sm:px-4 md:px-6">
          {/* Row 1 */}
          <Button
            value="C"
            onClick={clear}
            className="bg-gray-500 hover:bg-gray-400 text-black font-medium"
          />
          <Button
            value="±"
            onClick={toggleSign}
            className="bg-gray-500 hover:bg-gray-400 text-black font-medium"
          />
          <Button
            value="%"
            onClick={percentage}
            className="bg-gray-500 hover:bg-gray-400 text-black font-medium"
          />
          <Button
            value="÷"
            onClick={() => inputOperation('÷')}
            className={`${
              state.operation === '÷' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'
            } hover:bg-orange-400 font-normal`}
          />

          {/* Row 2 */}
          <Button
            value="7"
            onClick={() => inputNumber('7')}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          />
          <Button
            value="8"
            onClick={() => inputNumber('8')}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          />
          <Button
            value="9"
            onClick={() => inputNumber('9')}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          />
          <Button
            value="×"
            onClick={() => inputOperation('×')}
            className={`${
              state.operation === '×' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'
            } hover:bg-orange-400 font-normal`}
          />

          {/* Row 3 */}
          <Button
            value="4"
            onClick={() => inputNumber('4')}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          />
          <Button
            value="5"
            onClick={() => inputNumber('5')}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          />
          <Button
            value="6"
            onClick={() => inputNumber('6')}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          />
          <Button
            value="-"
            onClick={() => inputOperation('-')}
            className={`${
              state.operation === '-' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'
            } hover:bg-orange-400 font-light`}
          />

          {/* Row 4 */}
          <Button
            value="1"
            onClick={() => inputNumber('1')}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          />
          <Button
            value="2"
            onClick={() => inputNumber('2')}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          />
          <Button
            value="3"
            onClick={() => inputNumber('3')}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          />
          <Button
            value="+"
            onClick={() => inputOperation('+')}
            className={`${
              state.operation === '+' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'
            } hover:bg-orange-400 font-light`}
          />

          {/* Row 5 */}
          <Button
            value="0"
            onClick={() => inputNumber('0')}
            className="bg-gray-800 hover:bg-gray-700 text-white text-left pl-4 sm:pl-6 md:pl-8"
            span={true}
          />
          <Button
            value="."
            onClick={inputDecimal}
            className="bg-gray-800 hover:bg-gray-700 text-white"
          />
          <Button
            value="="
            onClick={calculate}
            className="bg-orange-500 hover:bg-orange-400 text-white font-light"
          />
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return <Calculator />;
}