import chalk from 'chalk';

const BANNER = `
██╗   ██╗██╗██████╗ ███████╗      ██████╗ ██████╗  █████╗ ███████╗████████╗
██║   ██║██║██╔══██╗██╔════╝      ██╔══██╗██╔══██╗██╔══██╗██╔════╝╚══██╔══╝
██║   ██║██║██████╔╝█████╗  █████╗██║  ██║██████╔╝███████║█████╗     ██║   
╚██╗ ██╔╝██║██╔══██╗██╔══╝  ╚════╝██║  ██║██╔══██╗██╔══██║██╔══╝     ██║   
 ╚████╔╝ ██║██████╔╝███████╗      ██████╔╝██║  ██║██║  ██║██║        ██║   
  ╚═══╝  ╚═╝╚═════╝ ╚══════╝      ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝   
`;

const TAGLINE = '✨ VibeDraft - Where Specs Meet Vibes ✨';

export function showBanner() {
  const lines = BANNER.trim().split('\n');
  const colors = [
    chalk.blueBright,
    chalk.blue,
    chalk.cyan,
    chalk.cyanBright,
    chalk.white,
    chalk.whiteBright
  ];

  lines.forEach((line, i) => {
    const color = colors[i % colors.length];
    console.log(color(line));
  });

  console.log(chalk.yellowBright.italic(`\n${TAGLINE}\n`));
}
