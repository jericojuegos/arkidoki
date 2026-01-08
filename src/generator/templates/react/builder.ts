export class CodeBuilder {
    private imports: Set<string> = new Set();
    private state: string[] = [];
    private effects: string[] = [];
    private methods: string[] = [];
    private jsx: string = '';

    addImport(statement: string) {
        if (statement) this.imports.add(statement);
        return this;
    }

    addState(name: string, initialValue: string | number | boolean, type?: string, setterName?: string) {
        const typePart = type ? `<${type}>` : '';
        const setter = setterName || `set${name.charAt(0).toUpperCase() + name.slice(1)}`;
        this.state.push(`    const [${name}, ${setter}] = useState${typePart}(${initialValue});`);
        return this;
    }

    addEffect(code: string) {
        this.effects.push(code);
        return this;
    }

    addMethod(code: string) {
        this.methods.push(code);
        return this;
    }

    setJSX(code: string) {
        this.jsx = code;
        return this;
    }

    build(componentName: string): string {
        const importsList = Array.from(this.imports).join('\n');
        const stateList = this.state.join('\n');
        const methodsList = this.methods.join('\n\n');
        const effectsList = this.effects.join('\n\n');

        return `
${importsList}

export const ${componentName} = () => {
${stateList}

${methodsList}

${effectsList}

${this.jsx}
};
`.trim();
    }
}
