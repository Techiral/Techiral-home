import type { Video, Blog } from './types';

export const NAV_LINKS = [
  { name: 'Home', href: '#' },
  { name: 'Videos', href: '#/videos' },
  { name: 'Blog', href: '#/blogs' },
  { name: 'Connect', href: '#connect' },
];

// This data is now used as a one-time seed if localStorage is empty.
export const SEED_VIDEOS_DATA: Video[] = [
  {
    id: '72KcZewI0Ns',
    title: 'The REAL Way to Center a Div (No, Seriously)',
    description: 'Forget the hacks and outdated methods. In this video, we cover the three modern, bulletproof ways to center a div using Flexbox, Grid, and Position Absolute with Transforms. We explain the pros and cons of each, so you can choose the right one for any situation.',
    transcript: `(0:00) (Intro Music) Hey everyone, welcome back to Techiral. Today, we're tackling the oldest question in the CSS bible: how do you center a div? It sounds simple, but it trips up so many developers. So let's cut through the noise and look at the three best ways to do it in modern CSS.

(0:25) First up, the fan favorite: Flexbox. This is probably the one you'll use 90% of the time. All you need is a parent container. On that parent, you set 'display: flex', then 'justify-content: center' for horizontal centering, and 'align-items: center' for vertical centering. Boom. Done. It's that easy. Your div is now perfectly centered. The great thing about Flexbox is that it's a one-dimensional layout system, so it's perfect for centering single items or aligning items in a row or column.

(1:05) Method two: CSS Grid. Grid is Flexbox's powerful big brother. It's a two-dimensional layout system. For centering a single item, it's just as easy. On the parent container, set 'display: grid' and then 'place-items: center'. That's it. One line. 'place-items' is a shorthand for 'align-items' and 'justify-items'. This is incredibly clean and readable. You'd typically reach for Grid when you have more complex, two-dimensional layouts, but for simple centering, it's a fantastic and concise option.

(1:40) Our third and final method is the classic 'position absolute' with transforms. This one is useful when the item you're centering needs to be taken out of the normal document flow, like for a modal or a popup. First, you set the parent container to 'position: relative'. Then, on the child div you want to center, you set 'position: absolute', 'top: 50%', and 'left: 50%'. Now, this gets it close, but the top-left corner is at the center, not the div itself. The magic final step is to add 'transform: translate(-50%, -50%)'. This transform pulls the div back up and to the left by half of its own width and height, resulting in perfect centering. It's a bit more verbose, but it's essential for certain UI patterns.

(2:25) So there you have it. Flexbox for everyday use, Grid for clean syntax and 2D layouts, and Position Absolute for elements outside the normal flow. Stop struggling and start centering like a pro. If this helped you, drop a like and subscribe for more web development tips. (2:40) (Outro Music)`,
    // FIX: Add missing properties to satisfy the Video type.
    faqs: [],
    keyMoments: [],
    metaTitle: 'How to Center a Div: 3 Modern CSS Methods | Techiral',
    metaDescription: 'Learn the 3 best ways to center a div using modern CSS: Flexbox, Grid, and Position Absolute. Perfect for beginners and experts alike.',
  },
];

export const SEED_BLOGS_DATA: Blog[] = [
    {
        id: 'understanding-react-hooks',
        mediumUrl: 'https://medium.com/p/abc12345',
        title: 'Understanding React Hooks: A Deep Dive into useState and useEffect',
        description: 'Go beyond the basics of React Hooks. This article explores the "why" behind useState and useEffect, explaining the concept of closures and the rules of Hooks to help you write more predictable and powerful functional components.',
        content: `React Hooks revolutionized how we write components. Before Hooks, if you needed state or lifecycle methods, you had to refactor your simple functional component into a class component. Hooks let us use state and other React features without writing a class. Let's explore the two most fundamental hooks: useState and useEffect.

**The Magic of useState**
At its core, useState provides a way for functional components to hold state. When you call \`const [count, setCount] = useState(0);\`, React does a few things. It initializes a state variable, 'count', to 0. It also gives you a function, 'setCount', to update that state. When you call 'setCount', you're not just changing a variable; you're telling React that the component's state has changed and it needs to re-render to reflect that change. This is the declarative power of React in action.

**Side Effects with useEffect**
What about things that aren't part of the main render, like fetching data, subscribing to events, or manually changing the DOM? These are called "side effects." The useEffect hook is the place for them. Think of it as a combination of componentDidMount, componentDidUpdate, and componentWillUnmount. For example, \`useEffect(() => { document.title = \`You clicked \${count} times\`; }, [count]);\` will run after every render where 'count' has changed. The array at the end, \`[count]\`, is the dependency array. It tells React to only re-run the effect if the values inside have changed, optimizing performance. If you provide an empty array \`[]\`, the effect runs only once, just like componentDidMount.`,
        faqs: [],
        keyMoments: [],
        metaTitle: 'React Hooks Explained: useState & useEffect | Techiral',
        metaDescription: 'A deep dive into React Hooks. Understand how useState and useEffect work under the hood, including closures and the dependency array.'
    }
];
