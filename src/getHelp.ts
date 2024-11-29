export const getHelp = (inclHeader = false) => {
  let help = "";
  if (inclHeader) {
    help += "Identify Package Manager\n";
    help +=
      "A tool to check the used package manager in a given repository (npm, yarn classic, yarn berry, pnpm, bun)\n";
  }
  help += "\n";
  help += "Usage:\n";
  help += "identify-package-manager\n";
  help += "\n";
  help += "Options:\n";
  help += "-h, --help\t\tDisplay this help info\n";
  help += "-v, --version\t\tReturn this package's version number\n";
  help += "-n, --nameonly\t\tReturn the package manager's name only\n";
  help +=
    "\t\t\tIf the flag above is not being used, the result will be a JSON object containing info about both, the package manager's name + version.";
  return help;
};
