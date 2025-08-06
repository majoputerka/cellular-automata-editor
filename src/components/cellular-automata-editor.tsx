import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, RotateCcw, Download, Copy, Search, Shuffle, Pencil, Eraser, Trash2, Info, X } from 'lucide-react';

const CellularAutomataEditor = () => {
  const [cols, setCols] = useState(14);
  const [rows, setRows] = useState(14);
  const [rule, setRule] = useState(30);
  const [ruleSearch, setRuleSearch] = useState('');
  const [grid, setGrid] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('draw'); // 'draw' or 'erase'
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationRow, setAnimationRow] = useState(0);
  const [roundedCorners, setRoundedCorners] = useState(0);
  const [cellSize, setCellSize] = useState(20);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedRuleInfo, setSelectedRuleInfo] = useState(null);
  const [showRuleDropdown, setShowRuleDropdown] = useState(false);
  const animationRef = useRef(null);

  // Most interesting/known rules
  const popularRules = [
    { number: 30, name: "Rule 30", description: "Chaotic pattern generator, used in Mathematica's random number generator" },
    { number: 90, name: "Rule 90", description: "Sierpinski triangle generator, creates fractal patterns" },
    { number: 110, name: "Rule 110", description: "Turing complete, capable of universal computation" },
    { number: 184, name: "Rule 184", description: "Traffic flow model, simulates highway traffic patterns" },
    { number: 150, name: "Rule 150", description: "Additive cellular automaton, creates nested patterns" },
    { number: 54, name: "Rule 54", description: "Creates complex triangular structures" },
    { number: 126, name: "Rule 126", description: "Produces dense, chaotic patterns" },
    { number: 18, name: "Rule 18", description: "Simple fractal generator with clear structure" },
    { number: 22, name: "Rule 22", description: "Periodic patterns with interesting symmetries" },
    { number: 73, name: "Rule 73", description: "Complex boundary behavior with localized structures" }
  ];

  // Rule descriptions for modal
  const getRuleDescription = (ruleNumber) => {
    const popular = popularRules.find(r => r.number === ruleNumber);
    if (popular) return popular.description;
    
    // Generate basic description based on rule number
    const binary = ruleNumber.toString(2).padStart(8, '0');
    const activePatterns = [];
    const patterns = ['111', '110', '101', '100', '011', '010', '001', '000'];
    patterns.forEach((pattern, i) => {
      if (binary[i] === '1') activePatterns.push(pattern);
    });
    
    return `This rule activates cells when the neighborhood pattern is: ${activePatterns.join(', ')}`;
  };

  // Generate example pattern for modal
  const generateExamplePattern = (ruleNumber) => {
    const size = 14;
    const exampleGrid = Array(size).fill().map(() => Array(size).fill(false));
    
    // Set middle cell in first row
    exampleGrid[0][Math.floor(size / 2)] = true;
    
    const ruleLookup = getRuleLookup(ruleNumber);
    
    // Generate pattern
    for (let r = 1; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const left = exampleGrid[r-1][c-1] || false;
        const center = exampleGrid[r-1][c];
        const right = exampleGrid[r-1][c+1] || false;
        const pattern = `${left ? '1' : '0'}${center ? '1' : '0'}${right ? '1' : '0'}`;
        exampleGrid[r][c] = ruleLookup[pattern];
      }
    }
    
    return exampleGrid;
  };
  // Initialize empty grid
  useEffect(() => {
    const newGrid = Array(rows).fill().map((_, i) => 
      Array(cols).fill(i === 0 ? false : null)
    );
    setGrid(newGrid);
    setHasGenerated(false);
    setAnimationRow(0);
  }, [rows, cols]);

  // Generate rule lookup table
  const getRuleLookup = useCallback((ruleNumber) => {
    const binary = ruleNumber.toString(2).padStart(8, '0');
    return {
      '111': binary[0] === '1',
      '110': binary[1] === '1',
      '101': binary[2] === '1',
      '100': binary[3] === '1',
      '011': binary[4] === '1',
      '010': binary[5] === '1',
      '001': binary[6] === '1',
      '000': binary[7] === '1'
    };
  }, []);

  // Apply cellular automata rule
  const applyRule = useCallback((prevRow, ruleLookup) => {
    return prevRow.map((_, i) => {
      const left = prevRow[i - 1] || false;
      const center = prevRow[i];
      const right = prevRow[i + 1] || false;
      const pattern = `${left ? '1' : '0'}${center ? '1' : '0'}${right ? '1' : '0'}`;
      return ruleLookup[pattern];
    });
  }, []);

  // Handle cell interaction
  const handleCellInteraction = useCallback((rowIndex, colIndex, isClick = false) => {
    if (rowIndex !== 0) return; // Only allow editing first row
    
    setGrid(prev => {
      const newGrid = [...prev];
      if (isClick || isDrawing) {
        newGrid[0][colIndex] = tool === 'draw' ? true : false;
      }
      return newGrid;
    });
  }, [tool, isDrawing]);

  // Generate random seed
  const generateRandomSeed = useCallback(() => {
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[0] = Array(cols).fill().map(() => Math.random() > 0.5);
      // Reset other rows
      for (let i = 1; i < rows; i++) {
        newGrid[i] = Array(cols).fill(null);
      }
      return newGrid;
    });
    setHasGenerated(false);
    setAnimationRow(0);
  }, [cols, rows]);

  // Generate pattern with animation
  const generatePattern = useCallback(() => {
    if (isAnimating) return;
    
    const ruleLookup = getRuleLookup(rule);
    setIsAnimating(true);
    setAnimationRow(1);
    
    const animate = (currentRow) => {
      if (currentRow >= rows) {
        setIsAnimating(false);
        setHasGenerated(true);
        return;
      }
      
      setGrid(prev => {
        const newGrid = [...prev];
        if (currentRow > 0) {
          newGrid[currentRow] = applyRule(newGrid[currentRow - 1], ruleLookup);
        }
        return newGrid;
      });
      
      setAnimationRow(currentRow + 1);
      animationRef.current = setTimeout(() => animate(currentRow + 1), 50);
    };
    
    animate(1);
  }, [rule, rows, getRuleLookup, applyRule, isAnimating]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setCols(14);
    setRows(14);
    setRule(30);
    setRuleSearch('');
    setRoundedCorners(0);
    setCellSize(20);
    setTool('draw');
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsAnimating(false);
    setHasGenerated(false);
    setAnimationRow(0);
  }, []);

  // Clear everything including first row
  const clearAll = useCallback(() => {
    setGrid(Array(rows).fill().map((_, i) => 
      Array(cols).fill(i === 0 ? false : null)
    ));
    setHasGenerated(false);
    setAnimationRow(0);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsAnimating(false);
  }, [rows, cols]);
  // Reset image only
  const resetImage = useCallback(() => {
    setGrid(prev => {
      const newGrid = [...prev];
      for (let i = 1; i < rows; i++) {
        newGrid[i] = Array(cols).fill(null);
      }
      return newGrid;
    });
    setHasGenerated(false);
    setAnimationRow(0);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsAnimating(false);
  }, [rows, cols]);

  // Show rule info modal
  const showRuleInfo = (ruleNumber) => {
    setSelectedRuleInfo(ruleNumber);
    setShowRuleModal(true);
  };

  // Generate SVG with proper connected shapes
  const generateSVG = useCallback(() => {
    const width = cols * cellSize;
    const height = rows * cellSize;
    
    if (roundedCorners > 0) {
      // Create a binary matrix for filled cells
      const matrix = Array(rows).fill().map(() => Array(cols).fill(false));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r] && grid[r][c]) {
            matrix[r][c] = true;
          }
        }
      }
      
      // Find all connected components
      const visited = Array(rows).fill().map(() => Array(cols).fill(false));
      const components = [];
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (matrix[r][c] && !visited[r][c]) {
            // Find connected component using flood fill
            const component = [];
            const stack = [[r, c]];
            
            while (stack.length > 0) {
              const [cr, cc] = stack.pop();
              if (cr < 0 || cr >= rows || cc < 0 || cc >= cols || 
                  visited[cr][cc] || !matrix[cr][cc]) continue;
              
              visited[cr][cc] = true;
              component.push([cr, cc]);
              
              // Add 4-connected neighbors
              stack.push([cr-1, cc], [cr+1, cc], [cr, cc-1], [cr, cc+1]);
            }
            
            if (component.length > 0) {
              components.push(component);
            }
          }
        }
      }
      
      // Generate SVG path for each component
      let paths = '';
      components.forEach(component => {
        if (component.length === 1) {
          // Single cell - just a rounded rectangle
          const [r, c] = component[0];
          const x = c * cellSize;
          const y = r * cellSize;
          paths += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${roundedCorners}" ry="${roundedCorners}" fill="#000"/>`;
        } else {
          // Multiple cells - create a single path
          const minR = Math.min(...component.map(([r]) => r));
          const maxR = Math.max(...component.map(([r]) => r));
          const minC = Math.min(...component.map(([, c]) => c));
          const maxC = Math.max(...component.map(([, c]) => c));
          
          // Create a single rounded rectangle for the entire component
          const x = minC * cellSize;
          const y = minR * cellSize;
          const w = (maxC - minC + 1) * cellSize;
          const h = (maxR - minR + 1) * cellSize;
          
          paths += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${roundedCorners}" ry="${roundedCorners}" fill="#000"/>`;
        }
      });
      
      return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
    } else {
      // Generate individual rectangles without gaps
      let rects = '';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r] && grid[r][c]) {
            const x = c * cellSize;
            const y = r * cellSize;
            rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#000"/>`;
          }
        }
      }
      return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
    }
  }, [grid, cols, rows, roundedCorners, cellSize]);

  // Save as SVG
  const saveAsSVG = useCallback(() => {
    const svg = generateSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cellular-automata-rule${rule}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generateSVG, rule]);

  // Copy to clipboard (for Figma)
  const copyToFigma = useCallback(async () => {
    const svg = generateSVG();
    try {
      await navigator.clipboard.writeText(svg);
      alert('SVG copied to clipboard! You can paste it in Figma.');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }, [generateSVG]);

  // Filter rules based on search
  const filteredRules = Array.from({ length: 256 }, (_, i) => i)
    .filter(r => r.toString().includes(ruleSearch));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Layout - Horizontal on wide screens, vertical on tall screens */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* Settings Panel - Fixed width on left */}
        <div className="w-full lg:w-[460px] lg:min-w-[460px] bg-white border-r border-gray-200 p-6">
          {/* Header */}
          <h1 className="text-2xl font-bold mb-6">Cellular Automata Patterns Generation</h1>
          
          {/* Settings Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-medium">Settings</label>
              {(cols !== 14 || rows !== 14 || rule !== 30 || roundedCorners !== 0 || cellSize !== 20) && (
                <button
                  onClick={resetToDefaults}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset Settings
                </button>
              )}
            </div>
            
            {/* Columns and Rows */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Columns</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Rows</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            
            {/* Rule Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Search Rules</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={ruleSearch}
                  onChange={(e) => setRuleSearch(e.target.value)}
                  onFocus={() => setShowRuleDropdown(true)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg"
                />
                {showRuleDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {filteredRules.map(r => (
                      <div
                        key={r}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                        onClick={() => {
                          setRule(r);
                          setRuleSearch('');
                          setShowRuleDropdown(false);
                        }}
                      >
                        <span>Rule {r}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showRuleInfo(r);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Info size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Popular Rules Pills - Bigger */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {popularRules.map(({ number, name }) => (
                  <button
                    key={number}
                    onClick={() => setRule(number)}
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-full transition-colors ${
                      rule === number 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {number}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showRuleInfo(number);
                      }}
                      className="hover:bg-blue-600 rounded-full p-1"
                    >
                      <Info size={12} />
                    </button>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Rounded Corners Slider */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rounded Corners</label>
              <input
                type="range"
                min="0"
                max="10"
                value={roundedCorners}
                onChange={(e) => setRoundedCorners(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600">{roundedCorners}px</div>
            </div>
            
            {/* Cell Size Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Cell Size</label>
              <input
                type="range"
                min="8"
                max="32"
                step="2"
                value={cellSize}
                onChange={(e) => setCellSize(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600">{cellSize}px</div>
            </div>
            

          </div>
        </div>
        
        {/* Preview Area - Takes remaining space */}
        <div className="flex-1 bg-gray-50 relative">
          {/* Top Tool Bar */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setTool('draw')}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  tool === 'draw' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100 shadow-sm'
                }`}
                title="Draw"
              >
                <Pencil size={16} />
              </button>
              
              <button
                onClick={() => setTool('erase')}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  tool === 'erase' ? 'bg-red-500 text-white' : 'bg-white hover:bg-gray-100 shadow-sm'
                }`}
                title="Erase"
              >
                <Eraser size={16} />
              </button>
              
              <button
                onClick={generateRandomSeed}
                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 shadow-sm rounded-lg transition-colors"
                title="Random Seed"
              >
                <Shuffle size={16} />
                Random Seed
              </button>
              
              <button
                onClick={generatePattern}
                disabled={isAnimating}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                title="Generate Pattern"
              >
                <Play size={16} />
                {isAnimating ? 'Generating...' : 'Generate Pattern'}
              </button>
            </div>
            
            {hasGenerated && (
              <div className="flex gap-2">
                <button
                  onClick={resetImage}
                  className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-100 shadow-sm rounded-lg transition-colors"
                  title="Reset Image"
                >
                  <RotateCcw size={16} />
                </button>
                
                <button
                  onClick={clearAll}
                  className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-100 shadow-sm rounded-lg transition-colors"
                  title="Clear All"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
          
          {/* Grid Display - Top Aligned */}
          <div className="flex flex-col items-center pt-20 pb-24 px-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div 
                className="mx-auto"
                style={{ 
                  display: 'grid',
                  gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                  maxWidth: 'fit-content'
                }}
              >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              // Apply rounded corners live when roundedCorners > 0
              let cellStyle = {
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: cell ? '#000' : '#fff',
                border: 'none'
              };
              
              if (roundedCorners > 0 && cell) {
                // For live preview, we'll use a simpler approach
                // The SVG export will handle the proper connected component logic
                const hasTop = rowIndex > 0 && grid[rowIndex - 1] && grid[rowIndex - 1][colIndex];
                const hasBottom = rowIndex < rows - 1 && grid[rowIndex + 1] && grid[rowIndex + 1][colIndex];
                const hasLeft = colIndex > 0 && grid[rowIndex] && grid[rowIndex][colIndex - 1];
                const hasRight = colIndex < cols - 1 && grid[rowIndex] && grid[rowIndex][colIndex + 1];
                
                let borderRadius = '';
                if (!hasTop && !hasLeft) borderRadius += `${roundedCorners}px `;
                else borderRadius += '0px ';
                if (!hasTop && !hasRight) borderRadius += `${roundedCorners}px `;
                else borderRadius += '0px ';
                if (!hasBottom && !hasRight) borderRadius += `${roundedCorners}px `;
                else borderRadius += '0px ';
                if (!hasBottom && !hasLeft) borderRadius += `${roundedCorners}px`;
                else borderRadius += '0px';
                
                cellStyle.borderRadius = borderRadius;
              }
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`cursor-pointer transition-all ${
                    rowIndex === 0 ? 'hover:bg-gray-200' : ''
                  }`}
                  style={cellStyle}
                  onMouseDown={() => {
                    if (rowIndex === 0) {
                      setIsDrawing(true);
                      handleCellInteraction(rowIndex, colIndex, true);
                    }
                  }}
                  onMouseEnter={() => handleCellInteraction(rowIndex, colIndex)}
                  onMouseUp={() => setIsDrawing(false)}
                />
              );
            })
          )}
            </div>
          </div>
        </div>
        
        {/* Floating Bottom Bar - Centered in preview area */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="max-w-[560px] w-full mx-2 bg-white rounded-lg shadow-lg border">
            <div className="flex items-center justify-center gap-4 p-4">
              <button
                onClick={saveAsSVG}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Download size={16} />
                Save SVG
              </button>
              
              <button
                onClick={copyToFigma}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <Copy size={16} />
                Copy to Figma
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Rule Info Modal */}
      {showRuleModal && selectedRuleInfo !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Rule {selectedRuleInfo}</h3>
              <button
                onClick={() => setShowRuleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-700 mb-4">
              {getRuleDescription(selectedRuleInfo)}
            </p>
            
            {/* Example Pattern */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Example Pattern:</h4>
              <div 
                className="mx-auto border rounded"
                style={{ 
                  display: 'grid',
                  gridTemplateColumns: `repeat(14, 12px)`,
                  maxWidth: 'fit-content'
                }}
              >
                {generateExamplePattern(selectedRuleInfo).map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-3 h-3 ${cell ? 'bg-black' : 'bg-white'}`}
                      style={{ border: '0.5px solid #e5e7eb' }}
                    />
                  ))
                )}
              </div>
            </div>
            
            <button
              onClick={() => setShowRuleModal(false)}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showRuleDropdown && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowRuleDropdown(false)}
        />
      )}
    </div>
  );
};

export default CellularAutomataEditor;