import { Variants } from 'framer-motion'

export const dotVariants: Variants = {
  animate: {
    y: ['0%', '-50%', '0%'],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
}
