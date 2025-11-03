import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			'gradient-primary': 'linear-gradient(135deg, #0284c7 0%, #9333ea 100%)',
  			'gradient-primary-hover': 'linear-gradient(135deg, #0369a1 0%, #7c3aed 100%)',
  			'gradient-light': 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)',
  			'gradient-hero': 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #e0f2fe 100%)'
  		},
  		animation: {
  			'spin-slow': 'spin-slow 3s linear infinite',
  			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  			'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
  			shine: 'shine 3s ease-in-out infinite',
  			orbit: 'orbit 4s linear infinite',
  			'orbit-reverse': 'orbit-reverse 3s linear infinite',
  			gradient: 'gradient 3s ease infinite',
  			float: 'float 6s ease-in-out infinite',
  			'slide-up': 'slide-up 0.3s ease-out',
  			'slide-down': 'slide-down 0.3s ease-out'
  		},
  		keyframes: {
  			'spin-slow': {
  				from: {
  					transform: 'rotate(0deg)'
  				},
  				to: {
  					transform: 'rotate(360deg)'
  				}
  			},
  			'pulse-glow': {
  				'0%, 100%': {
  					boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
  				},
  				'50%': {
  					boxShadow: '0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(139, 92, 246, 0.6)'
  				}
  			},
  			'bounce-slow': {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			shine: {
  				from: {
  					transform: 'translateX(-100%) translateY(-100%) rotate(45deg)'
  				},
  				to: {
  					transform: 'translateX(100%) translateY(100%) rotate(45deg)'
  				}
  			},
  			orbit: {
  				from: {
  					transform: 'rotate(0deg) translateX(40px) rotate(0deg)'
  				},
  				to: {
  					transform: 'rotate(360deg) translateX(40px) rotate(-360deg)'
  				}
  			},
  			'orbit-reverse': {
  				from: {
  					transform: 'rotate(0deg) translateX(35px) rotate(0deg)'
  				},
  				to: {
  					transform: 'rotate(-360deg) translateX(35px) rotate(360deg)'
  				}
  			},
  			gradient: {
  				'0%': {
  					backgroundPosition: '0% 50%'
  				},
  				'50%': {
  					backgroundPosition: '100% 50%'
  				},
  				'100%': {
  					backgroundPosition: '0% 50%'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-20px)'
  				}
  			},
  			'slide-up': {
  				from: {
  					transform: 'translateY(100%)',
  					opacity: '0'
  				},
  				to: {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			'slide-down': {
  				from: {
  					transform: 'translateY(-100%)',
  					opacity: '0'
  				},
  				to: {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;