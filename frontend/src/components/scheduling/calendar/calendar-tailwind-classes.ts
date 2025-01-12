// this is used to generate all tailwind classes for the calendar
// if you want to use your own colors, you can override the classes here

export const colorOptions = [
  {
    value: 'Scheduled',
    label: 'Scheduled',
    color: 'indigo',
    class: {
      base: 'bg-blue-500 border-blue-500 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500',
      light: 'bg-blue-300 border-blue-300 bg-blue-300/10 text-blue-300',
      dark: 'dark:bg-blue-700 dark:border-blue-700 bg-blue-700/10 text-blue-700',
    },
  },
  {
    value: 'Cancelled',
    label: 'Cancelled',
    color: 'red',
    class: {
      base: 'bg-indigo-500 border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500',
      light: 'bg-indigo-300 border-indigo-300 bg-indigo-300/10 text-indigo-300',
      dark: 'dark:bg-indigo-700 dark:border-indigo-700 bg-indigo-700/10 text-indigo-700',
    },
  },
  {
    value: 'Completed',
    label: 'Completed',
    color: 'green',
    class: {
      base: 'bg-pink-500 border-pink-500 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500',
      light: 'bg-pink-300 border-pink-300 bg-pink-300/10 text-pink-300',
      dark: 'dark:bg-pink-700 dark:border-pink-700 bg-pink-700/10 text-pink-700',
    },
  },
  {
    value: 'No Show',
    label: 'No Show',
    color: 'orange',
    class: {
      base: 'bg-red-500 border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-500',
      light: 'bg-red-300 border-red-300 bg-red-300/10 text-red-300',
      dark: 'dark:bg-red-700 dark:border-red-700 bg-red-700/10 text-red-700',
    },
  },
  // {
  //   value: 'orange',
  //   label: 'Orange',
  //   class: {
  //     base: 'bg-orange-500 border-orange-500 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500',
  //     light: 'bg-orange-300 border-orange-300 bg-orange-300/10 text-orange-300',
  //     dark: 'dark:bg-orange-700 dark:border-orange-700 bg-orange-700/10 text-orange-700',
  //   },
  // },
  // {
  //   value: 'amber',
  //   label: 'Amber',
  //   class: {
  //     base: 'bg-amber-500 border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500',
  //     light: 'bg-amber-300 border-amber-300 bg-amber-300/10 text-amber-300',
  //     dark: 'dark:bg-amber-700 dark:border-amber-700 bg-amber-700/10 text-amber-700',
  //   },
  // },
  // {
  //   value: 'emerald',
  //   label: 'Emerald',
  //   class: {
  //     base: 'bg-emerald-500 border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500',
  //     light:
  //       'bg-emerald-300 border-emerald-300 bg-emerald-300/10 text-emerald-300',
  //     dark: 'dark:bg-emerald-700 dark:border-emerald-700 bg-emerald-700/10 text-emerald-700',
  //   },
  // },
]

export const statusColors = {
  Scheduled: {
    value: 'Scheduled',
    label: 'Scheduled',
    class: {
      base: "bg-primary/20 border-primary/20 text-primary",
      dark: "dark:bg-primary/10 dark:border-primary/10 dark:text-primary",
    },
  },
  Completed: {
    value: 'Completed',
    label: 'Completed',
    class: {
      base: "bg-green-400/20 border-green-400/20 text-green-400",
      dark: "dark:bg-green-400/10 dark:border-green-400/10 dark:text-green-400",
    },
  },
  Cancelled: {
    value: 'Cancelled',
    label: 'Cancelled',
    class: {
      base: "bg-red-400/20 border-red-400/20 text-red-400",
      dark: "dark:bg-red-400/10 dark:border-red-400/10 dark:text-red-400",
    },
  },
  "No Show": {
    value: 'No Show',
    label: 'No Show',
    class: {
      base: "bg-orange-400/20 border-orange-400/20 text-orange-400",
      dark: "dark:bg-orange-400/10 dark:border-orange-400/10 dark:text-orange-400",
    },
  },
};