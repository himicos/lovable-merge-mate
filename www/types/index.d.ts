/// <reference types="react" />

declare namespace JSX {
  interface IntrinsicElements {
    div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
    section: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
    p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
    span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
    button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
    br: React.DetailedHTMLProps<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>
  }
}

declare module "next/image" {
  import { DetailedHTMLProps, ImgHTMLAttributes } from "react"
  
  type Props = DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
    src: string
    alt: string
    width?: number
    height?: number
    fill?: boolean
    priority?: boolean
    className?: string
  }
  
  export default function Image(props: Props): JSX.Element
}

declare module "framer-motion" {
  import { ComponentType, CSSProperties, ReactNode } from "react"

  interface MotionProps {
    initial?: object | false
    animate?: object | false
    transition?: {
      duration?: number
      delay?: number
      ease?: string
      type?: string
      stiffness?: number
      damping?: number
    }
    whileHover?: object
    whileTap?: object
    className?: string
    style?: CSSProperties
    children?: ReactNode
  }

  export const motion: {
    div: ComponentType<MotionProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>>
  }
}

declare module "@/components/ui/button" {
  import { ButtonHTMLAttributes } from "react"
  
  type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg"
    asChild?: boolean
  }
  
  export const Button: React.FC<ButtonProps>
}
