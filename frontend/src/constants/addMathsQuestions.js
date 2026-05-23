// Master Data Cluster: Form 5 KSSM Additional Mathematics Problem banks
export const addMathsSyllabusQuiz = {
  'Chapter 1: Circular Measure': [
    {
      id: 1,
      question: "An arc of a circle subtends an angle of $\\theta$ radians at the center of a circle with a radius of $r\\text{ cm}$. If the perimeter of the sector is $24\\text{ cm}$ and its area is $32\\text{ cm}^2$, find the possible values of $r$.",
      options: ["$r = 4\\text{ or } r = 8$", "$r = 2\\text{ or } r = 16$", "$r = 6\\text{ or } r = 12$", "$r = 3\\text{ or } r = 9$"],
      correctAnswer: 0,
      explanation: "Using perimeter: $2r + s = 24 \\implies s = 24 - 2r$. Using area: $A = \\frac{1}{2}r^2\\theta = \\frac{1}{2}rs = 32$. Substituting $s$: $\\frac{1}{2}r(24 - 2r) = 32 \\implies 12r - r^2 = 32 \\implies r^2 - 12r + 32 = 0$. Solving the quadratic yields $(r-4)(r-8) = 0$, so $r = 4$ or $r = 8$."
    },
    {
      id: 2,
      question: "A sector of a circle has a radius of $10\\text{ cm}$ and an arc length of $12\\text{ cm}$. Find the area of the sector in $\\text{cm}^2$.",
      options: ["$120\\text{ cm}^2$", "$60\\text{ cm}^2$", "$30\\text{ cm}^2$", "$50\\text{ cm}^2$"],
      correctAnswer: 1,
      explanation: "The area of a sector can be computed using the direct geometric relationship $A = \\frac{1}{2}rs$. Given $r = 10$ and $s = 12$, substituting the values gives $A = \\frac{1}{2}(10)(12) = 60\\text{ cm}^2$."
    }
  ],

  'Chapter 2: Differentiation': [
    {
      id: 1,
      question: "Given that $y = \\frac{2x + 3}{x - 1}$, find the derivative value $\\frac{dy}{dx}$.",
      options: ["$\\frac{5}{(x-1)^2}$", "$-\\frac{5}{(x-1)^2}$", "$\\frac{1}{(x-1)^2}$", "$-\\frac{1}{(x-1)^2}$"],
      correctAnswer: 1,
      explanation: "Apply the Quotient Rule where $u = 2x+3 \\implies u' = 2$, and $v = x-1 \\implies v' = 1$. The formula states $\\frac{dy}{dx} = \\frac{u'v - uv'}{v^2}$. Substituting gives $\\frac{2(x-1) - (2x+3)(1)}{(x-1)^2} = \\frac{2x - 2 - 2x - 3}{(x-1)^2} = -\\frac{5}{(x-1)^2}$."
    },
    {
      id: 2,
      question: "The radius of a spherical balloon increases at a constant rate of $0.5\\text{ cm s}^{-1}$. Find the rate of change of its volume, in $\\text{cm}^3\\text{ s}^{-1}$, at the instant when its radius is $3\\text{ cm}$.",
      options: ["$18\\pi$", "$9\\pi$", "$36\\pi$", "$4.5\\pi$"],
      correctAnswer: 0,
      explanation: "The volume of a sphere is $V = \\frac{4}{3}\\pi r^3$, so $\\frac{dV}{dr} = 4\\pi r^2$. By the Chain Rule, $\\frac{dV}{dt} = \\frac{dV}{dr} \\times \\frac{dr}{dt}$. At $r = 3$, $\\frac{dV}{dr} = 4\\pi(3)^2 = 36\\pi$. Given $\\frac{dr}{dt} = 0.5$, we get $\\frac{dV}{dt} = 36\\pi \\times 0.5 = 18\\pi$."
    }
  ],

  'Chapter 3: Integration': [
    {
      id: 1,
      question: "Evaluate the definite algebraic integration limit: $\\int_{1}^{3} (3x^2 - 2x) \\, dx$.",
      options: ["$18$", "$20$", "$26$", "$14$"],
      correctAnswer: 0,
      explanation: "Find the indefinite integral first: $\\int (3x^2 - 2x) \\, dx = \\left[ x^3 - x^2 \\right]$. Evaluating across the limits from 1 to 3: $(3^3 - 3^2) - (1^3 - 1^2) = (27 - 9) - (1 - 1) = 18 - 0 = 18$."
    },
    {
      id: 2,
      question: "Find the volume of the solid generated, in terms of $\\pi$, when the bounded region enclosed by the curve $y = x^2$, the y-axis, and the straight lines $y = 1$ and $y = 4$ is revolved through $360^\\circ$ about the y-axis.",
      options: ["$7.5\\pi$", "$15\\pi$", "$6\\pi$", "$8.5\\pi$"],
      correctAnswer: 0,
      explanation: "For a revolution around the y-axis, the volume formula is $V = \\pi \\int_{a}^{b} x^2 \\, dy$. Since $y = x^2$, we substitute $x^2 = y$ directly into the integrand: $V = \\pi \\int_{1}^{4} y \\, dy = \\pi \\left[ \\frac{y^2}{2} \\right]_{1}^{4} = \\pi \\left( \\frac{16}{2} - \\frac{1}{2} \\right) = 7.5\\pi$."
    }
  ]
}