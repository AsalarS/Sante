/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      "./node_modules/mina-scheduler/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      fontFamily: {
        logo: ["Comfortaa", "sans-serif"],
        body: ["Montserrat", "sans-serif"],
      },
      container: {
        center: true,
        padding: "1.5rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: {
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        colors: {
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          primary: {
            DEFAULT: "hsl(228, 99%, 71%)",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          "darker-background": "hsl(var(--darker-background))",
          "even-darker-background": "hsl(var(--even-darker-background))",
          "dash-hover": "hsl(var(--dash-hover))",
          "dash-active": "hsl(var(--dash-active))",
          "background-hover": "hsl(var(--background-hover))",
          "btn-normal": "hsl(var(--btn-normal))",
          "btn-hover": "hsl(var(--btn-hover))",
          chart: {
            1: "hsl(var(--chart-1))",
            2: "hsl(var(--chart-2))",
            3: "hsl(var(--chart-3))",
            4: "hsl(var(--chart-4))",
            5: "hsl(var(--chart-5))",
          },
          gradient: {
            1: "hsl(var(--gradient-1))",
          },
        },
        keyframes: {
          "accordion-down": {
            from: {
              height: "0",
            },
            to: {
              height: "var(--radix-accordion-content-height)",
            },
          },
          "accordion-up": {
            from: {
              height: "var(--radix-accordion-content-height)",
            },
            to: {
              height: "0",
            },
          },
          appear: {
            "0%": {
              opacity: "0",
            },
            "100%": {
              opacity: "1",
            },
          },
          fadeInLeft: {
            "0%": { opacity: "0", transform: "translateX(-100%)" },
            "100%": { opacity: "1", transform: "translateX(0)" },
          },
          fadeOutLeft: {
            "0%": { opacity: "1", transform: "translateX(0)" },
            "100%": { opacity: "0", transform: "translateX(-100%)" },
          },
          fadeInRight: {
            "0%": { opacity: "0", transform: "translateX(100%)" },
            "100%": { opacity: "1", transform: "translateX(0)" },
          },
          fadeOutRight: {
            "0%": { opacity: "1", transform: "translateX(0)" },
            "100%": { opacity: "0", transform: "translateX(100%)" },
          },
          zoomIn: {
            "0%": { opacity: "0", transform: "scale(0.5)" },
            "100%": { opacity: "1", transform: "scale(1)" },
          },
          zoomOut: {
            "0%": { opacity: "1", transform: "scale(1)" },
            "100%": { opacity: "0", transform: "scale(0.5)" },
          },
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
          appear: "appear 0.5s ease-in-out",
          "fade-in-left": "fadeInLeft 0.3s ease-out",
          "fade-out-left": "fadeOutLeft 0.3s ease-out",
          "fade-in-right": "fadeInRight 0.3s ease-out",
          "fade-out-right": "fadeOutRight 0.3s ease-out",
          "zoom-in": "zoomIn 0.3s ease-out",
          "zoom-out": "zoomOut 0.3s ease-out",
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
  };