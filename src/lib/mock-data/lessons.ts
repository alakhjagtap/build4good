import { Lesson, DesmosSegmentState } from "@/types/lesson";

// Pre-built Desmos 3D states for the gradient vectors lesson.
// Uses Desmos.Graphing3D expressions: z = f(x,y) for surfaces, (x,y,z) for points,
// parametric (x(t),y(t),z(t)) for curves/vectors.
const gradientDesmosStates: Record<string, DesmosSegmentState> = {
  hook: {
    commands: [
      { id: "surface", latex: "z = x^2 + y^2", color: "#6366f1" },
      { id: "pt", latex: "(1, 1, 2)", color: "#fbbf24" },
    ],
  },
  intuition: {
    commands: [
      { id: "surface", latex: "z = x^2 + y^2", color: "#6366f1" },
      { id: "pt", latex: "(1.5, 1, 3.25)", color: "#fbbf24" },
      { id: "grad", latex: "(1.5 + 3t, 1 + 2t, 3.25)", color: "#ef4444" },
    ],
  },
  breakdown1: {
    commands: [
      { id: "surface", latex: "z = x^2 + y^2", color: "#6366f1" },
      { id: "pt", latex: "(1, 1, 2)", color: "#fbbf24" },
      { id: "dx", latex: "(1 + t, 1, 2 + 2t)", color: "#ef4444" },
      { id: "dy", latex: "(1, 1 + t, 2 + 2t)", color: "#22c55e" },
    ],
  },
  breakdown2: {
    commands: [
      { id: "surface", latex: "z = x^2 + y^2", color: "#6366f1" },
      { id: "pt", latex: "(1, 1, 2)", color: "#fbbf24" },
      { id: "grad_vec", latex: "(1 + 2t, 1 + 2t, 2)", color: "#ef4444" },
    ],
  },
  visualDemo: {
    commands: [
      { id: "surface", latex: "z = x^2 + y^2", color: "#6366f1" },
      { id: "a", latex: "a = 1", sliderBounds: { min: -3, max: 3, step: 0.1 } },
      { id: "b", latex: "b = 1", sliderBounds: { min: -3, max: 3, step: 0.1 } },
      { id: "pt", latex: "(a, b, a^2 + b^2)", color: "#fbbf24" },
      { id: "arrow", latex: "(a + 2a \\cdot t, b + 2b \\cdot t, a^2 + b^2)", color: "#ef4444" },
    ],
  },
  workedExample: {
    commands: [
      { id: "surface", latex: "z = x^2 y + y^3", color: "#6366f1" },
      { id: "pt", latex: "(2, -1, -3)", color: "#fbbf24" },
      { id: "arrow", latex: "(2 - 4t, -1 + 7t, -3)", color: "#ef4444" },
    ],
  },
  practice: {
    commands: [
      { id: "surface", latex: "z = e^x \\sin(y)", color: "#6366f1" },
      { id: "pt", latex: "(0, \\frac{\\pi}{2}, 1)", color: "#fbbf24" },
    ],
  },
  recap: {
    commands: [
      { id: "surface", latex: "z = x^2 + y^2", color: "#6366f1" },
      { id: "a", latex: "a = 2", sliderBounds: { min: -3, max: 3, step: 0.1 } },
      { id: "b", latex: "b = 0", sliderBounds: { min: -3, max: 3, step: 0.1 } },
      { id: "pt", latex: "(a, b, a^2 + b^2)", color: "#fbbf24" },
      { id: "arrow", latex: "(a + 2a \\cdot t, b + 2b \\cdot t, a^2 + b^2)", color: "#ef4444" },
    ],
  },
};

const gradientVectorsLesson: Lesson = {
  id: "gradient-vectors",
  title: "Gradient Vectors & Directional Derivatives",
  concept: "gradient",
  hook: "Imagine you're standing on a mountainside in thick fog. You can feel the slope beneath your feet, but you can't see the peak. The gradient vector is your compass — it always points in the direction of steepest ascent. Today we'll learn how to compute it and why it's one of the most powerful tools in all of calculus.",
  intuition:
    "A gradient vector packages all the partial derivatives of a function into a single vector. For a function f(x, y), the gradient ∇f = ⟨∂f/∂x, ∂f/∂y⟩ points in the direction where f increases the fastest. Its magnitude tells you how steep that increase is. Perpendicular to the gradient? That's a contour line — no change at all.",
  keyFormulas: [
    {
      label: "Gradient Vector",
      formula:
        "\\\\nabla f(x, y) = \\\\left\\\\langle \\\\frac{\\\\partial f}{\\\\partial x}, \\\\frac{\\\\partial f}{\\\\partial y} \\\\right\\\\rangle",
    },
    {
      label: "Directional Derivative",
      formula:
        "D_{\\\\mathbf{u}} f = \\\\nabla f \\\\cdot \\\\mathbf{u}",
    },
    {
      label: "Maximum Rate of Change",
      formula:
        "\\\\max D_{\\\\mathbf{u}} f = \\\\|\\\\nabla f\\\\|",
    },
  ],
  breakdownSteps: [
    {
      id: "grad-step-1",
      title: "Compute Partial Derivatives",
      explanation:
        "Take the partial derivative with respect to each variable independently, treating all other variables as constants.",
      formula:
        "\\\\frac{\\\\partial f}{\\\\partial x} = 2x, \\\\quad \\\\frac{\\\\partial f}{\\\\partial y} = 2y",
      visualState: { showGradient: false, showContours: true },
      duration: 12,
    },
    {
      id: "grad-step-2",
      title: "Assemble the Gradient Vector",
      explanation:
        "Combine the partial derivatives into a vector. This vector lives in the input space (the xy-plane), not on the surface itself.",
      formula:
        "\\\\nabla f(x, y) = \\\\langle 2x, 2y \\\\rangle",
      visualState: { showGradient: true, showContours: true },
      duration: 10,
    },
    {
      id: "grad-step-3",
      title: "Evaluate at a Point",
      explanation:
        "Plug in specific coordinates to get the gradient at that location. At (1, 1), we get ⟨2, 2⟩ — pointing away from the origin, up the paraboloid.",
      formula:
        "\\\\nabla f(1, 1) = \\\\langle 2, 2 \\\\rangle",
      visualState: {
        showGradient: true,
        showContours: true,
        initialPoint: [1, 1],
      },
      duration: 10,
    },
    {
      id: "grad-step-4",
      title: "Interpret the Magnitude",
      explanation:
        "The length of the gradient tells us the steepness. Here ||∇f(1,1)|| = √(4+4) = 2√2 ≈ 2.83. A larger magnitude means a steeper slope at that point.",
      formula:
        "\\\\|\\\\nabla f(1,1)\\\\| = \\\\sqrt{4 + 4} = 2\\\\sqrt{2}",
      visualState: { showGradient: true },
      duration: 12,
    },
  ],
  visualizationType: "surface-gradient",
  visualizationConfig: {
    type: "surface-gradient",
    func: "x² + y²",
    funcExpr: (x: number, y: number) => x * x + y * y,
    xRange: [-3, 3],
    yRange: [-3, 3],
    zRange: [0, 18],
    initialPoint: [1, 1],
    showGradient: true,
    showTangentPlane: false,
    showContours: true,
    colorScheme: "viridis",
    sliders: [
      {
        id: "point-x",
        label: "Point X",
        min: -2.5,
        max: 2.5,
        step: 0.1,
        defaultValue: 1,
      },
      {
        id: "point-y",
        label: "Point Y",
        min: -2.5,
        max: 2.5,
        step: 0.1,
        defaultValue: 1,
      },
    ],
    toggles: [
      { id: "show-gradient", label: "Show Gradient Vector", defaultValue: true },
      { id: "show-contours", label: "Show Contour Lines", defaultValue: true },
      { id: "show-tangent-plane", label: "Show Tangent Plane", defaultValue: false },
    ],
  },
  workedExample: {
    problem:
      "Find the gradient of f(x, y) = x²y + y³ at the point (2, -1). In which direction does f increase the fastest?",
    steps: [
      {
        text: "Compute the partial derivative with respect to x, treating y as a constant.",
        formula: "\\\\frac{\\\\partial f}{\\\\partial x} = 2xy",
      },
      {
        text: "Compute the partial derivative with respect to y, treating x as a constant.",
        formula: "\\\\frac{\\\\partial f}{\\\\partial y} = x^2 + 3y^2",
      },
      {
        text: "Assemble the gradient vector from both partials.",
        formula:
          "\\\\nabla f(x,y) = \\\\langle 2xy,\\; x^2 + 3y^2 \\\\rangle",
      },
      {
        text: "Evaluate the gradient at the point (2, -1).",
        formula:
          "\\\\nabla f(2, -1) = \\\\langle 2(2)(-1),\\; (2)^2 + 3(-1)^2 \\\\rangle = \\\\langle -4, 7 \\\\rangle",
      },
      {
        text: "The function increases fastest in the direction of ⟨-4, 7⟩. The maximum rate of increase is the magnitude of this vector.",
        formula:
          "\\\\|\\\\nabla f(2,-1)\\\\| = \\\\sqrt{16 + 49} = \\\\sqrt{65}",
      },
    ],
    answer:
      "∇f(2, -1) = ⟨-4, 7⟩. The function increases fastest in the direction ⟨-4, 7⟩ with maximum rate √65 ≈ 8.06.",
  },
  guidedPractice: {
    problem:
      "Find the gradient of g(x, y) = eˣ sin(y) at the point (0, π/2).",
    hints: [
      "Remember: ∂/∂x treats y as a constant. The derivative of eˣ is eˣ, and sin(y) is just a constant multiplier when differentiating with respect to x.",
      "For ∂g/∂y, eˣ is the constant multiplier. What is the derivative of sin(y)?",
    ],
    solution:
      "∇g(0, π/2) = ⟨1, 0⟩",
    solutionSteps: [
      "∂g/∂x = eˣ sin(y)",
      "∂g/∂y = eˣ cos(y)",
      "∇g(x, y) = ⟨eˣ sin(y), eˣ cos(y)⟩",
      "∇g(0, π/2) = ⟨e⁰ sin(π/2), e⁰ cos(π/2)⟩ = ⟨1·1, 1·0⟩ = ⟨1, 0⟩",
    ],
  },
  recap:
    "The gradient vector ∇f collects all partial derivatives into one vector. It points in the direction of steepest increase, its magnitude gives the rate of that increase, and it's always perpendicular to contour lines. This concept is foundational — it appears in optimization, physics, machine learning, and virtually every branch of applied mathematics.",
  commonMistakes: [
    "Forgetting that the gradient lives in the input space (xy-plane), not on the surface itself.",
    "Not normalizing the direction vector when computing directional derivatives — D_u f requires u to be a unit vector.",
    "Confusing the gradient direction (steepest ascent) with the normal to the surface in 3D. The gradient of f(x,y) is a 2D vector, not a 3D surface normal.",
    "Evaluating the gradient formula symbolically but forgetting to plug in the specific point coordinates.",
  ],
  segments: [
    {
      id: "grad-seg-hook",
      type: "hook",
      title: "The Mountain Compass",
      content:
        "Imagine hiking up a mountain in thick fog. You can't see the summit, but you can feel the slope under your boots. What if you had a magical compass that always pointed uphill, in the steepest direction? That's exactly what the gradient vector does for any surface in multivariable calculus.",
      duration: 15,
      visualState: {
        showGradient: false,
        showContours: true,
        showTangentPlane: false,
      },
      captionText:
        "Picture yourself on a foggy mountain. The gradient is your compass — always pointing toward the steepest uphill direction.",
      desmosState: gradientDesmosStates.hook,
    },
    {
      id: "grad-seg-intuition",
      type: "intuition",
      title: "What Does the Gradient Mean?",
      content:
        "For a function f(x, y), each partial derivative tells you the slope in one direction — ∂f/∂x is the slope when you walk in the x-direction, and ∂f/∂y is the slope in the y-direction. The gradient combines these into a single vector ⟨∂f/∂x, ∂f/∂y⟩. This vector is always perpendicular to the contour lines and points where f increases the fastest.",
      formula:
        "\\\\nabla f = \\\\left\\\\langle \\\\frac{\\\\partial f}{\\\\partial x}, \\\\frac{\\\\partial f}{\\\\partial y} \\\\right\\\\rangle",
      duration: 18,
      visualState: { showGradient: true, showContours: true },
      captionText:
        "The gradient packs both partial derivatives into one vector. It always points perpendicular to contour lines, toward the steepest ascent.",
      desmosState: gradientDesmosStates.intuition,
    },
    {
      id: "grad-seg-breakdown-1",
      type: "breakdown",
      title: "Step 1: Compute the Partial Derivatives",
      content:
        "Let's work with f(x, y) = x² + y². To find ∂f/∂x, treat y as a constant and differentiate with respect to x. We get 2x. For ∂f/∂y, treat x as constant to get 2y. These are the building blocks of the gradient.",
      formula:
        "\\\\frac{\\\\partial f}{\\\\partial x} = 2x, \\\\quad \\\\frac{\\\\partial f}{\\\\partial y} = 2y",
      duration: 14,
      visualState: { showGradient: false, showContours: true },
      captionText:
        "First, we take partial derivatives. Differentiate with respect to x holding y constant, then with respect to y holding x constant.",
      desmosState: gradientDesmosStates.breakdown1,
    },
    {
      id: "grad-seg-breakdown-2",
      type: "breakdown",
      title: "Step 2: Assemble and Evaluate",
      content:
        "Now we combine the partials into the gradient vector: ∇f = ⟨2x, 2y⟩. At the point (1, 1), this becomes ⟨2, 2⟩. Notice how this vector points directly away from the origin — that's exactly the direction of steepest ascent on our paraboloid bowl.",
      formula:
        "\\\\nabla f(1,1) = \\\\langle 2(1), 2(1) \\\\rangle = \\\\langle 2, 2 \\\\rangle",
      duration: 14,
      visualState: {
        showGradient: true,
        showContours: true,
        initialPoint: [1, 1],
      },
      captionText:
        "Combine the partials into a vector and plug in the point. At (1,1), the gradient is ⟨2,2⟩ — pointing directly away from the origin.",
      desmosState: gradientDesmosStates.breakdown2,
    },
    {
      id: "grad-seg-visual-demo",
      type: "visual-demo",
      title: "Watch the Gradient Move",
      content:
        "Drag the point around the surface and watch the gradient vector change. On the paraboloid x² + y², the gradient always points radially outward from the origin. Near the bottom (the origin), the gradient is short — the surface is nearly flat. Farther out, the gradient grows longer as the surface becomes steeper. Notice how the gradient arrow is always perpendicular to the circular contour lines.",
      duration: 20,
      visualState: {
        showGradient: true,
        showContours: true,
        showTangentPlane: false,
      },
      captionText:
        "Move the point around and watch the gradient respond. Near the origin it's short; farther out it's longer. It's always perpendicular to contour lines.",
      desmosState: gradientDesmosStates.visualDemo,
    },
    {
      id: "grad-seg-worked-example",
      type: "worked-example",
      title: "Worked Example: f(x, y) = x²y + y³",
      content:
        "Let's find the gradient of f(x, y) = x²y + y³ at (2, -1). First: ∂f/∂x = 2xy, and ∂f/∂y = x² + 3y². So ∇f = ⟨2xy, x² + 3y²⟩. At (2, -1): ∇f = ⟨2(2)(-1), 4 + 3⟩ = ⟨-4, 7⟩. The steepest ascent direction is ⟨-4, 7⟩ and the maximum rate of change is √65 ≈ 8.06.",
      formula:
        "\\\\nabla f(2,-1) = \\\\langle -4, 7 \\\\rangle, \\\\quad \\\\|\\\\nabla f\\\\| = \\\\sqrt{65}",
      duration: 18,
      visualState: { showGradient: true },
      captionText:
        "We compute each partial, build the gradient, evaluate at the point, and find the magnitude. The direction of steepest ascent is ⟨-4, 7⟩.",
      desmosState: gradientDesmosStates.workedExample,
    },
    {
      id: "grad-seg-practice",
      type: "practice",
      title: "Your Turn: g(x, y) = eˣ sin(y)",
      content:
        "Find the gradient of g(x, y) = eˣ sin(y) at (0, π/2). Start by finding each partial derivative, then assemble the gradient and evaluate at the given point. Take a moment before checking the solution.",
      duration: 15,
      visualState: { showGradient: false, showContours: true },
      captionText:
        "Now it's your turn. Find the gradient of eˣ sin(y) at (0, π/2). Pause and try it before I reveal the answer.",
      desmosState: gradientDesmosStates.practice,
    },
    {
      id: "grad-seg-recap",
      type: "recap",
      title: "Key Takeaways",
      content:
        "The gradient ∇f is a vector of all partial derivatives. It points in the direction of steepest increase. Its magnitude is the rate of that increase. It's perpendicular to contour lines. And it's the foundation for directional derivatives, optimization algorithms like gradient descent, and so much more.",
      duration: 12,
      visualState: { showGradient: true, showContours: true },
      captionText:
        "Remember: the gradient points uphill, its length is the steepness, and it's perpendicular to level curves. This idea powers optimization across all of science.",
      desmosState: gradientDesmosStates.recap,
    },
  ],
};

const partialDerivativesLesson: Lesson = {
  id: "partial-derivatives",
  title: "Partial Derivatives",
  concept: "partial-derivatives",
  hook: "What if you could freeze every variable except one and ask: how is this function changing right now, in just this one direction? That's exactly what a partial derivative does — it isolates a single axis of change in a multivariable world.",
  intuition:
    "A partial derivative is just an ordinary derivative in disguise. When you compute ∂f/∂x, you hold y (and all other variables) constant, then differentiate with respect to x as if it were a single-variable function. The result tells you the instantaneous rate of change of f in the x-direction alone. Do the same for each variable and you capture the full picture of how f changes locally.",
  keyFormulas: [
    {
      label: "Partial with respect to x",
      formula:
        "\\\\frac{\\\\partial f}{\\\\partial x} = \\\\lim_{h \\\\to 0} \\\\frac{f(x+h, y) - f(x, y)}{h}",
    },
    {
      label: "Partial with respect to y",
      formula:
        "\\\\frac{\\\\partial f}{\\\\partial y} = \\\\lim_{h \\\\to 0} \\\\frac{f(x, y+h) - f(x, y)}{h}",
    },
    {
      label: "Mixed Partial (Clairaut's Theorem)",
      formula:
        "\\\\frac{\\\\partial^2 f}{\\\\partial x \\\\partial y} = \\\\frac{\\\\partial^2 f}{\\\\partial y \\\\partial x}",
    },
  ],
  breakdownSteps: [
    {
      id: "pd-step-1",
      title: "Hold Other Variables Constant",
      explanation:
        "To compute ∂f/∂x, pretend y is just a fixed number — like y = 3. Now differentiate with respect to x using all the single-variable rules you already know.",
      formula:
        "f(x, y) = x^2 y + 3y^2 \\\\implies \\\\frac{\\\\partial f}{\\\\partial x} = 2xy",
      duration: 12,
    },
    {
      id: "pd-step-2",
      title: "Differentiate with Respect to y",
      explanation:
        "Now freeze x and differentiate with respect to y. The x² term becomes a constant coefficient.",
      formula:
        "\\\\frac{\\\\partial f}{\\\\partial y} = x^2 + 6y",
      duration: 10,
    },
    {
      id: "pd-step-3",
      title: "Geometric Interpretation",
      explanation:
        "Graphically, ∂f/∂x at a point is the slope of the curve you get when you slice the surface with a plane parallel to the xz-plane through that point. It's the slope of the tangent line on that slice.",
      visualState: {
        type: "partial-derivatives",
        showContours: true,
      },
      duration: 12,
    },
  ],
  visualizationType: "partial-derivatives",
  visualizationConfig: {
    type: "partial-derivatives",
    func: "sin(x) · cos(y)",
    funcExpr: (x: number, y: number) => Math.sin(x) * Math.cos(y),
    xRange: [-Math.PI, Math.PI],
    yRange: [-Math.PI, Math.PI],
    zRange: [-1.5, 1.5],
    initialPoint: [0.5, 0.5],
    showGradient: false,
    showContours: true,
    colorScheme: "plasma",
    sliders: [
      {
        id: "point-x",
        label: "Point X",
        min: -3,
        max: 3,
        step: 0.1,
        defaultValue: 0.5,
      },
      {
        id: "point-y",
        label: "Point Y",
        min: -3,
        max: 3,
        step: 0.1,
        defaultValue: 0.5,
      },
    ],
    toggles: [
      { id: "show-x-slice", label: "Show x-slice", defaultValue: true },
      { id: "show-y-slice", label: "Show y-slice", defaultValue: true },
      { id: "show-contours", label: "Show Contour Lines", defaultValue: false },
    ],
  },
  workedExample: {
    problem:
      "Find all first-order partial derivatives of f(x, y) = x³y² − 2xy + 5y.",
    steps: [
      {
        text: "Differentiate with respect to x, holding y constant.",
        formula:
          "\\\\frac{\\\\partial f}{\\\\partial x} = 3x^2 y^2 - 2y",
      },
      {
        text: "Differentiate with respect to y, holding x constant.",
        formula:
          "\\\\frac{\\\\partial f}{\\\\partial y} = 2x^3 y - 2x + 5",
      },
      {
        text: "Evaluate both at the point (1, 2).",
        formula:
          "f_x(1,2) = 3(1)(4) - 2(2) = 8, \\\\quad f_y(1,2) = 2(1)(2) - 2 + 5 = 7",
      },
    ],
    answer:
      "∂f/∂x = 3x²y² − 2y and ∂f/∂y = 2x³y − 2x + 5. At (1, 2): fₓ = 8, f_y = 7.",
  },
  guidedPractice: {
    problem:
      "Find both partial derivatives of h(x, y) = ln(x² + y) and evaluate them at (1, 1).",
    hints: [
      "Use the chain rule: the derivative of ln(u) is 1/u times the derivative of u. For ∂h/∂x, the inner function u = x² + y has derivative 2x with respect to x.",
      "For ∂h/∂y, the inner function x² + y has derivative 1 with respect to y. Then plug in (1, 1).",
    ],
    solution: "hₓ(1,1) = 1, h_y(1,1) = 1/2",
    solutionSteps: [
      "∂h/∂x = 2x / (x² + y)",
      "∂h/∂y = 1 / (x² + y)",
      "hₓ(1,1) = 2(1) / (1 + 1) = 2/2 = 1",
      "h_y(1,1) = 1 / (1 + 1) = 1/2",
    ],
  },
  recap:
    "Partial derivatives measure the rate of change of a multivariable function along a single axis. Hold every other variable constant and differentiate normally. Geometrically, you're finding the slope of a cross-sectional slice of the surface. Partial derivatives are the building blocks for gradients, tangent planes, and all of multivariable optimization.",
  commonMistakes: [
    "Forgetting to actually hold the other variable constant — accidentally differentiating both x and y at the same time (that's the total derivative, not a partial).",
    "Dropping constant terms from the other variable. For example, in ∂/∂x of (x² + 3y²), the 3y² is a constant and its derivative is 0, not 6y.",
    "Misapplying the chain rule when the variables appear inside composed functions like sin(xy) or e^(x²y).",
    "Confusing ∂f/∂x (partial) with df/dx (ordinary) — the notation matters because it signals which variables are held fixed.",
  ],
  segments: [
    {
      id: "pd-seg-hook",
      type: "hook",
      title: "One Direction at a Time",
      content:
        "In single-variable calculus you asked 'how fast is f changing?' and there was only one direction to worry about. In multivariable calculus the function can change differently along every possible direction. Partial derivatives solve this by letting you isolate one direction at a time.",
      duration: 14,
      visualState: { showContours: true },
      captionText:
        "In single-variable calc, change happens on a line. In multivariable calc, change happens in infinitely many directions. Partial derivatives isolate one direction at a time.",
    },
    {
      id: "pd-seg-intuition",
      type: "intuition",
      title: "Freezing Variables",
      content:
        "Think of partial derivatives like a scientific experiment: change one variable while holding everything else fixed. If f(x, y) = sin(x)cos(y), then ∂f/∂x asks: if I nudge x a tiny bit while y stays put, how much does f change? You literally treat y as a constant and differentiate in x.",
      formula:
        "\\\\frac{\\\\partial}{\\\\partial x}[\\\\sin(x)\\\\cos(y)] = \\\\cos(x)\\\\cos(y)",
      duration: 16,
      visualState: { showContours: true },
      captionText:
        "Treat every other variable as a constant. Differentiate normally. That's all a partial derivative is.",
    },
    {
      id: "pd-seg-breakdown",
      type: "breakdown",
      title: "Computing Partials Step by Step",
      content:
        "For f(x, y) = x²y + 3y², to find ∂f/∂x: y is a constant, so x²y differentiates to 2xy, and 3y² is just a constant that vanishes. For ∂f/∂y: x² is a constant coefficient, giving x², and 3y² becomes 6y.",
      formula:
        "f_x = 2xy, \\\\quad f_y = x^2 + 6y",
      duration: 15,
      visualState: { showContours: true },
      captionText:
        "Hold one variable constant, differentiate the other. Repeat for each variable. That gives you the full set of first-order partials.",
    },
    {
      id: "pd-seg-visual-demo",
      type: "visual-demo",
      title: "Slicing the Surface",
      content:
        "Watch as we slice the surface sin(x)cos(y) with planes. A slice parallel to the xz-plane reveals a curve whose slope is ∂f/∂x. A slice parallel to the yz-plane reveals a curve whose slope is ∂f/∂y. Move the point and see how each slope changes across the surface.",
      duration: 18,
      visualState: { showContours: true },
      captionText:
        "Each partial derivative is the slope of a slice through the surface. Move the point and watch the slopes change.",
    },
    {
      id: "pd-seg-worked-example",
      type: "worked-example",
      title: "Worked Example: f = x³y² − 2xy + 5y",
      content:
        "Differentiate with respect to x: 3x²y² − 2y. With respect to y: 2x³y − 2x + 5. At (1, 2): fₓ = 3(1)(4) − 4 = 8 and f_y = 2(1)(2) − 2 + 5 = 7.",
      formula:
        "f_x(1,2) = 8, \\\\quad f_y(1,2) = 7",
      duration: 15,
      visualState: { showContours: true },
      captionText:
        "We differentiate term by term, holding the right variable constant each time, then evaluate at the given point.",
    },
    {
      id: "pd-seg-practice",
      type: "practice",
      title: "Your Turn: h(x, y) = ln(x² + y)",
      content:
        "Find ∂h/∂x and ∂h/∂y for h(x, y) = ln(x² + y), then evaluate at (1, 1). Remember the chain rule: the derivative of ln(u) is (1/u) · u'.",
      duration: 14,
      visualState: { showContours: false },
      captionText:
        "Try this one yourself. Use the chain rule with ln. Pause and work it out before I show the solution.",
    },
    {
      id: "pd-seg-recap",
      type: "recap",
      title: "Partial Derivatives Recap",
      content:
        "Partial derivatives isolate one direction of change at a time. They're computed just like ordinary derivatives with the other variables treated as constants. Geometrically they give slopes of cross-sectional slices. They form the gradient vector and are essential for tangent planes, optimization, and differential equations.",
      duration: 12,
      captionText:
        "Partial derivatives: hold, differentiate, interpret. They're the atoms of multivariable calculus — everything else is built from them.",
    },
  ],
};

const tangentPlanesLesson: Lesson = {
  id: "tangent-planes",
  title: "Tangent Planes & Linear Approximation",
  concept: "tangent-plane",
  hook: "A tangent line approximates a curve near a point. In 3D, the analog is a tangent plane — the best flat surface that hugs a curved surface at a single point. It's the key to linearization, and it turns hard nonlinear problems into easy linear ones.",
  intuition:
    "At any smooth point on a surface z = f(x, y), there's a unique plane that just barely touches the surface. This plane is built from two ingredients: the partial derivative in x (which gives the plane's tilt in the x-direction) and the partial derivative in y (the tilt in the y-direction). Together, they define how the plane is oriented. The tangent plane is the best linear approximation to the surface near that point.",
  keyFormulas: [
    {
      label: "Tangent Plane Equation",
      formula:
        "z = f(a,b) + f_x(a,b)(x - a) + f_y(a,b)(y - b)",
    },
    {
      label: "Linear Approximation",
      formula:
        "L(x,y) = f(a,b) + f_x(a,b)(x-a) + f_y(a,b)(y-b)",
    },
    {
      label: "Normal Vector to Surface",
      formula:
        "\\\\mathbf{n} = \\\\langle f_x(a,b),\\; f_y(a,b),\\; -1 \\\\rangle",
    },
  ],
  breakdownSteps: [
    {
      id: "tp-step-1",
      title: "Find the Point on the Surface",
      explanation:
        "Evaluate f at the point (a, b) to get the height z₀ = f(a, b). This is where the tangent plane will touch the surface.",
      formula: "z_0 = f(a, b)",
      duration: 10,
    },
    {
      id: "tp-step-2",
      title: "Compute the Partial Derivatives",
      explanation:
        "Find fₓ(a,b) and f_y(a,b). These determine how steeply the plane tilts in each coordinate direction.",
      formula:
        "f_x(a,b), \\\\quad f_y(a,b)",
      duration: 10,
    },
    {
      id: "tp-step-3",
      title: "Write the Tangent Plane Equation",
      explanation:
        "Plug everything into the formula: z = z₀ + fₓ(a,b)(x − a) + f_y(a,b)(y − b). This plane passes through (a, b, z₀) with the correct slopes.",
      formula:
        "z = f(a,b) + f_x(a,b)(x - a) + f_y(a,b)(y - b)",
      visualState: { showTangentPlane: true },
      duration: 12,
    },
  ],
  visualizationType: "tangent-plane",
  visualizationConfig: {
    type: "tangent-plane",
    func: "sin(x)·y",
    funcExpr: (x: number, y: number) => Math.sin(x) * y,
    xRange: [-3, 3],
    yRange: [-3, 3],
    zRange: [-4, 4],
    initialPoint: [1, 1],
    showGradient: false,
    showTangentPlane: true,
    showContours: false,
    colorScheme: "cool",
    sliders: [
      {
        id: "point-x",
        label: "Point X",
        min: -2.5,
        max: 2.5,
        step: 0.1,
        defaultValue: 1,
      },
      {
        id: "point-y",
        label: "Point Y",
        min: -2.5,
        max: 2.5,
        step: 0.1,
        defaultValue: 1,
      },
    ],
    toggles: [
      { id: "show-tangent-plane", label: "Show Tangent Plane", defaultValue: true },
      { id: "show-normal", label: "Show Normal Vector", defaultValue: false },
    ],
  },
  workedExample: {
    problem:
      "Find the equation of the tangent plane to z = x² + y² at the point (1, 2, 5).",
    steps: [
      {
        text: "Verify the point lies on the surface: f(1, 2) = 1 + 4 = 5. ✓",
        formula: "f(1, 2) = 1^2 + 2^2 = 5",
      },
      {
        text: "Compute the partial derivatives.",
        formula:
          "f_x = 2x, \\\\quad f_y = 2y",
      },
      {
        text: "Evaluate at (1, 2).",
        formula:
          "f_x(1,2) = 2, \\\\quad f_y(1,2) = 4",
      },
      {
        text: "Plug into the tangent plane formula.",
        formula:
          "z = 5 + 2(x - 1) + 4(y - 2)",
      },
      {
        text: "Simplify to standard form.",
        formula: "z = 2x + 4y - 5",
        visualState: { showTangentPlane: true },
      },
    ],
    answer: "z = 2x + 4y − 5",
  },
  guidedPractice: {
    problem:
      "Find the tangent plane to z = eˣʸ at (1, 0, 1).",
    hints: [
      "First compute fₓ = yeˣʸ and f_y = xeˣʸ using the chain rule.",
      "Evaluate both partials at (1, 0): fₓ(1,0) = 0·e⁰ = 0, f_y(1,0) = 1·e⁰ = 1. Then use the tangent plane formula.",
    ],
    solution: "z = 1 + 0·(x − 1) + 1·(y − 0) → z = y + 1",
    solutionSteps: [
      "fₓ = yeˣʸ → fₓ(1,0) = 0",
      "f_y = xeˣʸ → f_y(1,0) = 1",
      "z = 1 + 0·(x − 1) + 1·(y − 0)",
      "z = y + 1",
    ],
  },
  recap:
    "The tangent plane is the best flat approximation to a surface at a point. It's determined by the two partial derivatives (the tilts in x and y) and the function value (the height). This leads directly to linear approximation, which is one of the most practical tools in applied mathematics — replacing complicated functions with simple linear ones near a point of interest.",
  commonMistakes: [
    "Forgetting to verify that the given point actually lies on the surface before computing the tangent plane.",
    "Mixing up (x − a) and (y − b) with x and y — the shifts are essential since the plane passes through (a, b), not the origin.",
    "Computing the partials symbolically but forgetting to evaluate them at the specific point (a, b).",
    "Confusing the tangent plane normal vector ⟨fₓ, f_y, −1⟩ with the gradient ⟨fₓ, f_y⟩ — the normal has three components.",
  ],
  segments: [
    {
      id: "tp-seg-hook",
      type: "hook",
      title: "From Lines to Planes",
      content:
        "In Calc 1, the tangent line was your best friend for approximation: zoom in close enough on any smooth curve and it looks like a straight line. In Calc 3, surfaces replace curves, and the tangent plane replaces the tangent line. Zoom into any smooth surface and it looks flat — that flat patch is the tangent plane.",
      duration: 14,
      visualState: { showTangentPlane: false },
      captionText:
        "Tangent lines approximate curves. Tangent planes approximate surfaces. Zoom in enough and every smooth surface looks flat.",
    },
    {
      id: "tp-seg-intuition",
      type: "intuition",
      title: "Building a Plane from Slopes",
      content:
        "A plane through a point is determined by two directions of tilt. Conveniently, fₓ gives us the tilt in x and f_y gives the tilt in y. Combine the point with these two slopes and you have a unique plane. This plane is tangent to the surface — it touches at exactly one point and has the same slopes as the surface there.",
      formula:
        "z = f(a,b) + f_x(a,b)(x-a) + f_y(a,b)(y-b)",
      duration: 16,
      visualState: { showTangentPlane: true },
      captionText:
        "Two slopes and a point uniquely determine a plane. The partial derivatives provide those slopes.",
    },
    {
      id: "tp-seg-breakdown",
      type: "breakdown",
      title: "Deriving the Formula",
      content:
        "Start at the known height z₀ = f(a, b). Moving Δx in the x-direction changes z by approximately fₓ · Δx. Moving Δy in y changes z by f_y · Δy. Adding both: z ≈ f(a,b) + fₓ(x−a) + f_y(y−b). This is the tangent plane equation and also the linearization L(x, y).",
      formula:
        "z \\\\approx f(a,b) + f_x(a,b)\\\\Delta x + f_y(a,b)\\\\Delta y",
      duration: 15,
      visualState: { showTangentPlane: true },
      captionText:
        "Start at the known height. Each partial derivative contributes a linear correction. Together they give the tangent plane.",
    },
    {
      id: "tp-seg-visual-demo",
      type: "visual-demo",
      title: "Tangent Plane in Action",
      content:
        "Move the point across the surface and see the tangent plane tilt and shift to match. Where the surface is steep, the plane tilts sharply. Where it's nearly flat, the plane is almost horizontal. Toggle the normal vector to see the direction perpendicular to the tangent plane.",
      duration: 18,
      visualState: { showTangentPlane: true },
      captionText:
        "Drag the point around. The tangent plane hugs the surface locally. Watch how it tilts as you move to steeper regions.",
    },
    {
      id: "tp-seg-worked-example",
      type: "worked-example",
      title: "Example: Tangent Plane to x² + y²",
      content:
        "For z = x² + y² at (1, 2, 5): partials are fₓ = 2x = 2 and f_y = 2y = 4. The tangent plane is z = 5 + 2(x−1) + 4(y−2), which simplifies to z = 2x + 4y − 5.",
      formula:
        "z = 2x + 4y - 5",
      duration: 15,
      visualState: { showTangentPlane: true, initialPoint: [1, 2] },
      captionText:
        "Compute partials, evaluate at the point, plug into the formula, and simplify. That's the tangent plane.",
    },
    {
      id: "tp-seg-practice",
      type: "practice",
      title: "Your Turn: z = eˣʸ at (1, 0, 1)",
      content:
        "Find the tangent plane to z = eˣʸ at (1, 0, 1). Remember the chain rule for the partials of eˣʸ. Pause and try before checking.",
      duration: 14,
      captionText:
        "Try finding this tangent plane yourself. Use the chain rule for the partials of eˣʸ.",
    },
    {
      id: "tp-seg-recap",
      type: "recap",
      title: "Tangent Plane Recap",
      content:
        "The tangent plane z = f(a,b) + fₓ(x−a) + f_y(y−b) is the best flat approximation to a surface at a point. It's built from partial derivatives and is the foundation of linear approximation in higher dimensions. Master this, and you can linearize any smooth surface.",
      duration: 10,
      captionText:
        "The tangent plane: one height, two slopes, one powerful approximation. It's linearization in 3D.",
    },
  ],
};

const doubleIntegralsLesson: Lesson = {
  id: "double-integrals",
  title: "Double Integrals & Volume",
  concept: "double-integral",
  hook: "Single integrals find area under a curve. Double integrals find volume under a surface. Imagine stacking infinitely many paper-thin slices of area to build up a solid — that's the idea behind the double integral, and it generalizes to mass, probability, and far more.",
  intuition:
    "A double integral ∬ f(x,y) dA adds up the values of f over a 2D region R. If f is positive, each tiny rectangle of area dA contributes a thin column of height f(x,y) and volume f(x,y)·dA. Summing all these columns gives the total volume under the surface. We evaluate by iterating: integrate in one variable first (inner integral), then the other (outer integral).",
  keyFormulas: [
    {
      label: "Double Integral (Iterated)",
      formula:
        "\\\\iint_R f(x,y)\\\\, dA = \\\\int_a^b \\\\int_{g_1(x)}^{g_2(x)} f(x,y)\\\\, dy\\\\, dx",
    },
    {
      label: "Volume Under Surface",
      formula:
        "V = \\\\iint_R f(x,y)\\\\, dA",
    },
    {
      label: "Average Value",
      formula:
        "\\\\bar{f} = \\\\frac{1}{\\\\text{Area}(R)} \\\\iint_R f(x,y)\\\\, dA",
    },
  ],
  breakdownSteps: [
    {
      id: "di-step-1",
      title: "Identify the Region R",
      explanation:
        "Sketch or describe the region of integration in the xy-plane. Determine whether it's easier to describe with vertical slices (x outer, y inner) or horizontal slices (y outer, x inner).",
      duration: 10,
    },
    {
      id: "di-step-2",
      title: "Set Up the Inner Integral",
      explanation:
        "For fixed x, determine the limits for y (or vice versa). The inner integral adds up a single slice, producing a function of the outer variable.",
      formula:
        "\\\\int_{g_1(x)}^{g_2(x)} f(x,y)\\\\, dy",
      duration: 12,
    },
    {
      id: "di-step-3",
      title: "Evaluate and Integrate Outer",
      explanation:
        "Evaluate the inner integral to get a single-variable function, then integrate with respect to the outer variable over its range.",
      formula:
        "\\\\int_a^b \\\\left[ \\\\text{result of inner} \\\\right] dx",
      duration: 12,
    },
  ],
  visualizationType: "double-integral",
  visualizationConfig: {
    type: "double-integral",
    func: "4 − x² − y²",
    funcExpr: (x: number, y: number) => 4 - x * x - y * y,
    xRange: [-2, 2],
    yRange: [-2, 2],
    zRange: [0, 5],
    initialPoint: [0, 0],
    showContours: true,
    colorScheme: "inferno",
    sliders: [
      {
        id: "x-upper",
        label: "X Upper Limit",
        min: 0.5,
        max: 2,
        step: 0.1,
        defaultValue: 1,
      },
      {
        id: "y-upper",
        label: "Y Upper Limit",
        min: 0.5,
        max: 2,
        step: 0.1,
        defaultValue: 1,
      },
    ],
    toggles: [
      { id: "show-slices", label: "Show Slices", defaultValue: true },
      { id: "show-volume", label: "Shade Volume", defaultValue: true },
    ],
  },
  workedExample: {
    problem:
      "Evaluate ∬_R (x² + y) dA where R = [0, 1] × [0, 2].",
    steps: [
      {
        text: "Set up the iterated integral with y as the inner variable.",
        formula:
          "\\\\int_0^1 \\\\int_0^2 (x^2 + y)\\\\, dy\\\\, dx",
      },
      {
        text: "Evaluate the inner integral (integrate with respect to y).",
        formula:
          "\\\\int_0^2 (x^2 + y)\\\\, dy = \\\\left[ x^2 y + \\\\frac{y^2}{2} \\\\right]_0^2 = 2x^2 + 2",
      },
      {
        text: "Now evaluate the outer integral with respect to x.",
        formula:
          "\\\\int_0^1 (2x^2 + 2)\\\\, dx = \\\\left[ \\\\frac{2x^3}{3} + 2x \\\\right]_0^1 = \\\\frac{2}{3} + 2 = \\\\frac{8}{3}",
      },
    ],
    answer: "8/3",
  },
  guidedPractice: {
    problem:
      "Evaluate ∬_R xy dA where R = [0, 2] × [0, 3].",
    hints: [
      "Set up as ∫₀² ∫₀³ xy dy dx. The inner integral is ∫₀³ xy dy — remember x is a constant here.",
      "The inner integral gives x · [y²/2] from 0 to 3 = 9x/2. Now integrate 9x/2 with respect to x from 0 to 2.",
    ],
    solution: "9",
    solutionSteps: [
      "∫₀³ xy dy = x · [y²/2]₀³ = 9x/2",
      "∫₀² (9x/2) dx = (9/2) · [x²/2]₀² = (9/2)(2) = 9",
    ],
  },
  recap:
    "Double integrals extend single-variable integration to two dimensions. We evaluate them as iterated integrals — one variable at a time. They compute volumes, averages, mass, and probabilities over 2D regions. The key skill is setting up correct limits of integration and choosing the right order.",
  commonMistakes: [
    "Getting the limits of integration backwards or mixing up which limits depend on which variable.",
    "Treating the inner variable as a constant when it should be integrated — or vice versa.",
    "Forgetting to include dA (= dy dx or dx dy). The area element is essential and determines the order of integration.",
    "Not switching the order of integration when one order leads to an integral that can't be evaluated in closed form.",
  ],
  segments: [
    {
      id: "di-seg-hook",
      type: "hook",
      title: "From Areas to Volumes",
      content:
        "In Calc 1, you sliced regions into thin strips to find area. Now we go one dimension higher: slice a 3D solid into thin columns to find volume. The double integral adds up all these columns over a 2D region. It's the natural extension of everything you already know about integration.",
      duration: 14,
      visualState: { showContours: false },
      captionText:
        "Single integrals give area. Double integrals give volume. We're going from 2D slices to 3D columns.",
    },
    {
      id: "di-seg-intuition",
      type: "intuition",
      title: "Stacking Thin Columns",
      content:
        "Imagine the xy-plane divided into a fine grid of tiny rectangles, each with area ΔA = Δx · Δy. Above each rectangle, the surface f(x, y) defines a column of height f(x, y). The volume of each column is f(x,y) · ΔA. Sum all the columns and take the limit as the grid gets infinitely fine: that's the double integral ∬ f dA.",
      formula:
        "V = \\\\iint_R f(x,y)\\\\, dA",
      duration: 16,
      visualState: { showContours: true },
      captionText:
        "Divide the region into tiny rectangles. Each one holds a thin column. Sum them all up — that's the double integral.",
    },
    {
      id: "di-seg-breakdown",
      type: "breakdown",
      title: "Iterated Integrals",
      content:
        "We evaluate a double integral by doing two single integrals in sequence. Fix x, integrate f(x,y) over y (the inner integral) to get a function of x alone. Then integrate that result over x (the outer integral). The bounds for the inner integral can depend on the outer variable.",
      formula:
        "\\\\int_a^b \\\\left( \\\\int_{g_1(x)}^{g_2(x)} f(x,y)\\\\, dy \\\\right) dx",
      duration: 15,
      visualState: { showContours: true },
      captionText:
        "An iterated integral does one variable at a time. Inner integral first, then outer. The inner limits can depend on the outer variable.",
    },
    {
      id: "di-seg-visual-demo",
      type: "visual-demo",
      title: "Visualizing Volume Accumulation",
      content:
        "Watch as we integrate the downward paraboloid 4 − x² − y² over a rectangular region. Each slice at fixed x shows a cross-sectional area. As x sweeps from left to right, the slices stack together to fill out the volume. Adjust the limits and see how the accumulated volume changes.",
      duration: 18,
      visualState: { showContours: true },
      captionText:
        "See the slices stack together to build volume. Each slice is an inner integral. Sweeping through gives the full double integral.",
    },
    {
      id: "di-seg-worked-example",
      type: "worked-example",
      title: "Example: ∬ (x² + y) dA over [0,1]×[0,2]",
      content:
        "Inner integral: ∫₀² (x²+y) dy = [x²y + y²/2]₀² = 2x² + 2. Outer integral: ∫₀¹ (2x²+2) dx = [2x³/3 + 2x]₀¹ = 2/3 + 2 = 8/3. The volume under the surface over this rectangle is 8/3.",
      formula:
        "\\\\iint_R (x^2 + y)\\\\, dA = \\\\frac{8}{3}",
      duration: 16,
      visualState: { showContours: true },
      captionText:
        "Inner integral with respect to y gives 2x² + 2. Outer integral with respect to x gives 8/3. Done!",
    },
    {
      id: "di-seg-practice",
      type: "practice",
      title: "Your Turn: ∬ xy dA over [0,2]×[0,3]",
      content:
        "Evaluate ∬ xy dA over the rectangle [0, 2] × [0, 3]. Set up the iterated integral, evaluate the inner integral first, then the outer. Pause and try before checking the answer.",
      duration: 14,
      captionText:
        "Your turn. Integrate xy over the rectangle [0,2]×[0,3]. Inner integral first, then outer. Give it a shot.",
    },
    {
      id: "di-seg-recap",
      type: "recap",
      title: "Double Integrals Recap",
      content:
        "Double integrals sum f(x,y) over a 2D region. Evaluate via iterated integrals — one variable at a time. They compute volume, mass, averages, and more. The hardest part is usually setting up the correct limits. Always sketch the region first.",
      duration: 10,
      captionText:
        "Double integrals: iterate, integrate, accumulate. Sketch the region, set up limits carefully, and compute one integral at a time.",
    },
  ],
};

const lagrangeMultipliersLesson: Lesson = {
  id: "lagrange-multipliers",
  title: "Lagrange Multipliers",
  concept: "lagrange-multipliers",
  hook: "You want to maximize profit, but your budget is fixed. You want to find the highest point, but you're forced to walk along a specific path. Constrained optimization is everywhere in the real world, and Lagrange multipliers are the elegant mathematical tool that solves it. No substitution, no messy algebra — just a beautiful geometric condition.",
  intuition:
    "The key insight: at a constrained optimum, the gradient of the objective function is parallel to the gradient of the constraint. Why? If ∇f had any component along the constraint curve, you could still move along the curve to increase f — so you wouldn't be at the optimum. At the true optimum, all of ∇f points away from the constraint, meaning ∇f = λ∇g for some scalar λ (the Lagrange multiplier).",
  keyFormulas: [
    {
      label: "Lagrange Condition",
      formula:
        "\\\\nabla f = \\\\lambda \\\\nabla g",
    },
    {
      label: "System of Equations",
      formula:
        "f_x = \\\\lambda g_x, \\\\quad f_y = \\\\lambda g_y, \\\\quad g(x,y) = c",
    },
    {
      label: "Interpretation of λ",
      formula:
        "\\\\lambda \\\\approx \\\\frac{\\\\Delta f^*}{\\\\Delta c}",
    },
  ],
  breakdownSteps: [
    {
      id: "lm-step-1",
      title: "Identify f and g",
      explanation:
        "Determine what you're optimizing (the objective f) and what restriction you must satisfy (the constraint g(x,y) = c).",
      duration: 8,
    },
    {
      id: "lm-step-2",
      title: "Compute Both Gradients",
      explanation:
        "Find ∇f and ∇g. You need the partial derivatives of both the objective and the constraint.",
      formula:
        "\\\\nabla f = \\\\langle f_x, f_y \\\\rangle, \\\\quad \\\\nabla g = \\\\langle g_x, g_y \\\\rangle",
      duration: 10,
    },
    {
      id: "lm-step-3",
      title: "Set Up the Lagrange System",
      explanation:
        "Write the system: fₓ = λgₓ, f_y = λg_y, and g(x,y) = c. This gives three equations in three unknowns (x, y, λ).",
      formula:
        "f_x = \\\\lambda g_x, \\\\quad f_y = \\\\lambda g_y, \\\\quad g(x,y) = c",
      visualState: { showConstraint: true, showGradient: true },
      duration: 12,
    },
    {
      id: "lm-step-4",
      title: "Solve the System",
      explanation:
        "Solve the three equations simultaneously. Common strategies include dividing the first two equations to eliminate λ, then using the constraint to find the point(s).",
      duration: 12,
    },
  ],
  visualizationType: "lagrange-multipliers",
  visualizationConfig: {
    type: "lagrange-multipliers",
    func: "x² + y²",
    funcExpr: (x: number, y: number) => x * x + y * y,
    constraintFunc: "x + y = 4",
    constraintExpr: (x: number, y: number) => x + y,
    xRange: [-1, 5],
    yRange: [-1, 5],
    zRange: [0, 25],
    initialPoint: [2, 2],
    showGradient: true,
    showContours: true,
    showConstraint: true,
    colorScheme: "magma",
    sliders: [
      {
        id: "constraint-c",
        label: "Constraint Value (c)",
        min: 1,
        max: 6,
        step: 0.5,
        defaultValue: 4,
      },
    ],
    toggles: [
      { id: "show-gradients", label: "Show Gradients", defaultValue: true },
      { id: "show-contours", label: "Show Level Curves", defaultValue: true },
      { id: "show-constraint", label: "Show Constraint", defaultValue: true },
    ],
  },
  workedExample: {
    problem:
      "Minimize f(x, y) = x² + y² subject to the constraint g(x, y) = x + y = 4.",
    steps: [
      {
        text: "Compute the gradients of f and g.",
        formula:
          "\\\\nabla f = \\\\langle 2x, 2y \\\\rangle, \\\\quad \\\\nabla g = \\\\langle 1, 1 \\\\rangle",
      },
      {
        text: "Set up the Lagrange equations: ∇f = λ∇g.",
        formula:
          "2x = \\\\lambda, \\\\quad 2y = \\\\lambda",
      },
      {
        text: "From the first two equations, 2x = 2y, so x = y.",
        formula: "x = y",
      },
      {
        text: "Substitute into the constraint: x + y = 4 with x = y gives 2x = 4, so x = 2.",
        formula:
          "x = 2, \\\\quad y = 2, \\\\quad \\\\lambda = 4",
        visualState: { showConstraint: true, showGradient: true },
      },
    ],
    answer:
      "The minimum of f on the constraint x + y = 4 is f(2, 2) = 8, with λ = 4.",
  },
  guidedPractice: {
    problem:
      "Maximize f(x, y) = xy subject to x² + y² = 8.",
    hints: [
      "Compute ∇f = ⟨y, x⟩ and ∇g = ⟨2x, 2y⟩. Set up y = 2λx and x = 2λy.",
      "From y = 2λx and x = 2λy, substitute: y = 2λ(2λy) = 4λ²y. If y ≠ 0 then λ² = 1/4, so λ = ±1/2. Use the constraint to find x and y.",
    ],
    solution: "Maximum of f = 4 at (2, 2) and (−2, −2)",
    solutionSteps: [
      "∇f = ⟨y, x⟩, ∇g = ⟨2x, 2y⟩",
      "y = 2λx, x = 2λy → 4λ² = 1 → λ = ±1/2",
      "λ = 1/2: y = x. Constraint: 2x² = 8 → x = ±2 → (2,2) or (−2,−2)",
      "f(2,2) = 4, f(−2,−2) = 4. Maximum is 4.",
    ],
  },
  recap:
    "Lagrange multipliers find extrema of f subject to g = c by requiring ∇f = λ∇g — the gradients must be parallel at the optimum. Set up the system of equations, solve for x, y, and λ, then compare function values. The multiplier λ itself tells you the sensitivity: how much the optimal value changes per unit change in the constraint.",
  commonMistakes: [
    "Forgetting to include the constraint equation g(x, y) = c as one of the equations in the system — without it you have too few equations.",
    "Dividing by a variable that could be zero. Always check the case where x = 0 or y = 0 separately before dividing.",
    "Finding critical points but not comparing function values to determine which is the max and which is the min.",
    "Confusing the constraint g(x,y) = c with g(x,y) = 0. Make sure you use the correct value of c.",
  ],
  segments: [
    {
      id: "lm-seg-hook",
      type: "hook",
      title: "Optimization with Strings Attached",
      content:
        "In unconstrained optimization, you look everywhere for the best answer. But real life has constraints: budgets, physical limitations, design requirements. Lagrange multipliers let you find the best possible outcome while respecting these constraints — no substitution tricks required.",
      duration: 14,
      visualState: { showConstraint: true, showContours: true },
      captionText:
        "Real optimization has constraints. Lagrange multipliers find the best outcome on a constraint curve — elegantly, without substitution.",
    },
    {
      id: "lm-seg-intuition",
      type: "intuition",
      title: "Parallel Gradients",
      content:
        "Here's the geometric insight: walk along the constraint curve and watch the level curves of f. At the optimum, the constraint curve is tangent to a level curve — meaning ∇f and ∇g point in the same (or opposite) direction. If the gradients weren't parallel, you could slide along the constraint to improve f. At the optimum, there's nowhere better to go.",
      formula:
        "\\\\nabla f = \\\\lambda \\\\nabla g",
      duration: 18,
      visualState: {
        showConstraint: true,
        showContours: true,
        showGradient: true,
      },
      captionText:
        "At the optimum, ∇f is parallel to ∇g. If they weren't parallel, you could move along the constraint to do better.",
    },
    {
      id: "lm-seg-breakdown",
      type: "breakdown",
      title: "Setting Up the System",
      content:
        "To apply Lagrange multipliers: (1) Identify f (objective) and g (constraint with g = c). (2) Compute ∇f and ∇g. (3) Write fₓ = λgₓ, f_y = λg_y, and g(x,y) = c. That's 3 equations in 3 unknowns. Solve for x, y, and λ.",
      formula:
        "f_x = \\\\lambda g_x, \\\\quad f_y = \\\\lambda g_y, \\\\quad g(x,y) = c",
      duration: 15,
      visualState: { showConstraint: true, showGradient: true },
      captionText:
        "Three equations, three unknowns. The gradient condition plus the constraint gives a solvable system.",
    },
    {
      id: "lm-seg-visual-demo",
      type: "visual-demo",
      title: "Watching Gradients Align",
      content:
        "On the visualization, the red curve is the constraint x + y = c, and the blue curves are level curves of f = x² + y². Watch as we move along the constraint: the gradient vectors of f and g start at different angles, but at the minimum point (2, 2), they become perfectly parallel. That's the Lagrange condition in action.",
      duration: 18,
      visualState: {
        showConstraint: true,
        showContours: true,
        showGradient: true,
        initialPoint: [2, 2],
      },
      captionText:
        "Watch the gradients along the constraint. At most points they're not parallel. At the optimum, they align perfectly.",
    },
    {
      id: "lm-seg-worked-example",
      type: "worked-example",
      title: "Example: Minimize x² + y² on x + y = 4",
      content:
        "∇f = ⟨2x, 2y⟩, ∇g = ⟨1, 1⟩. Lagrange: 2x = λ, 2y = λ, so x = y. Constraint: 2x = 4, x = 2. Solution: (2, 2) with f = 8 and λ = 4. The closest point on x+y=4 to the origin is (2,2), at distance √8.",
      formula:
        "f(2,2) = 8, \\\\quad \\\\lambda = 4",
      duration: 16,
      visualState: {
        showConstraint: true,
        showGradient: true,
        initialPoint: [2, 2],
      },
      captionText:
        "Setting up the Lagrange system gives x = y from the gradient condition. The constraint pins it down: x = y = 2, minimum value is 8.",
    },
    {
      id: "lm-seg-practice",
      type: "practice",
      title: "Your Turn: Maximize xy on x² + y² = 8",
      content:
        "Use Lagrange multipliers to maximize f(x,y) = xy subject to g(x,y) = x² + y² = 8. Set up the three equations, solve for the critical points, and determine the maximum value.",
      duration: 15,
      captionText:
        "Now you try. Maximize xy on the circle x² + y² = 8. Set up the Lagrange system and solve. Pause and work it out.",
    },
    {
      id: "lm-seg-recap",
      type: "recap",
      title: "Lagrange Multipliers Recap",
      content:
        "Lagrange multipliers solve constrained optimization by requiring ∇f = λ∇g — the gradients are parallel at the optimum. Write the system, solve for x, y, and λ, then compare values. The multiplier λ tells you how sensitive the optimal value is to changes in the constraint. It's one of the most powerful techniques in all of applied mathematics.",
      duration: 12,
      captionText:
        "∇f = λ∇g at the optimum. Three equations, three unknowns. The multiplier λ measures sensitivity. A beautifully powerful method.",
    },
  ],
};

export const lessons: Lesson[] = [
  gradientVectorsLesson,
  partialDerivativesLesson,
  tangentPlanesLesson,
  doubleIntegralsLesson,
  lagrangeMultipliersLesson,
];

const lessonKeywords: Record<string, string[]> = {
  "gradient-vectors": [
    "gradient",
    "nabla",
    "directional derivative",
    "steepest",
    "ascent",
    "descent",
    "gradient vector",
    "rate of change",
    "direction",
  ],
  "partial-derivatives": [
    "partial",
    "partial derivative",
    "partials",
    "differentiate",
    "hold constant",
    "fx",
    "fy",
    "mixed partial",
    "clairaut",
  ],
  "tangent-planes": [
    "tangent plane",
    "tangent",
    "linear approximation",
    "linearization",
    "normal vector",
    "flat",
    "approximate",
    "plane",
  ],
  "double-integrals": [
    "double integral",
    "iterated integral",
    "volume",
    "integrate",
    "dA",
    "region",
    "area",
    "double",
    "integral",
  ],
  "lagrange-multipliers": [
    "lagrange",
    "multiplier",
    "constraint",
    "constrained",
    "optimize",
    "maximize",
    "minimize",
    "lambda",
    "subject to",
  ],
};

export function findLesson(query: string): Lesson | null {
  const lower = query.toLowerCase();

  for (const lesson of lessons) {
    if (lower.includes(lesson.id) || lower.includes(lesson.concept)) {
      return lesson;
    }
  }

  let bestMatch: Lesson | null = null;
  let bestScore = 0;

  for (const lesson of lessons) {
    const keywords = lessonKeywords[lesson.id] ?? [];
    const score = keywords.reduce(
      (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestMatch = lesson;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}
