export const getHelp = (inclHeader = false) => {
  let help = "";

  if (inclHeader) {
    help += "Identify Package Manager\n";
    help += "Detect the package manager used by a repository (npm, yarn classic, yarn berry, pnpm, bun).\n";
  }

  help += "\n";
  help += "Usage:\n";
  help += "identify-package-manager [options] [directory]\n";
  help += "\n";
  help += "Options:\n";
  help += "-h, --help\t\tDisplay this help info\n";
  help += "-v, --version\t\tReturn this package's version number\n";
  help += "-n, --nameonly\t\tReturn the package manager's name only\n";
  help += "\n";
  help += "If no directory is provided, the current working directory is used.\n";
  help += "Without --nameonly, the result is a JSON object containing the package manager name and version info when detectable.";

  return help;
};
