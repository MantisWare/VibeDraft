import chalk from 'chalk';

const BANNER = `

██╗   ██╗██╗██████╗ ███████╗      ██████╗ ██████╗  █████╗ ███████╗████████╗
██║   ██║██║██╔══██╗██╔════╝      ██╔══██╗██╔══██╗██╔══██╗██╔════╝╚══██╔══╝
██║   ██║██║██████╔╝█████╗  █████╗██║  ██║██████╔╝███████║█████╗     ██║   
╚██╗ ██╔╝██║██╔══██╗██╔══╝  ╚════╝██║  ██║██╔══██╗██╔══██║██╔══╝     ██║   
 ╚████╔╝ ██║██████╔╝███████╗      ██████╔╝██║  ██║██║  ██║██║        ██║   
  ╚═══╝  ╚═╝╚═════╝ ╚══════╝      ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝   

  `;

export function showBanner() {
  const lines = BANNER.trim().split('\n');
  // Colors inspired by the VibeDraft mascot: orange to teal gradient
  const colors = [
    chalk.hex('#FF8C42'),  // Bright orange (mascot head)
    chalk.hex('#FF9F5A'),  // Light orange
    chalk.hex('#FFA872'),  // Peachy orange
    chalk.hex('#42B5B5'),  // Teal (headphones)
    chalk.hex('#3AA3A3'),  // Deep teal
    chalk.hex('#2D8B8B')   // Darker teal
  ];

  lines.forEach((line, i) => {
    const color = colors[i % colors.length];
    console.log(color(line));
  });

  console.log(chalk.hex('#FF8C42').bold('✨ ') +
              chalk.hex('#FF9F5A')('Vibe') +
              chalk.hex('#42B5B5')('Draft') +
              chalk.hex('#42B5B5').bold(' - Where Specs Meet Vibes ✨\n'));
}
