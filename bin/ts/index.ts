// ============================================================================
// Import
// ============================================================================

// Import necessary modules and classes
import path from 'path';

import {
    DirectoryCleaner,
    DirectoryCopier,
    FileCopier,
    StyleProcessor,
    PackageCreator,
    VersionWriter,
    TypeScriptCompiler,
    JavaScriptMinifier,
    StylizedLogger,
    gl_installer,
    readPackageJson,
} from 'pack.gl';

// import SassDocGenerator from './SassDocGenerator.js';

// import ColorScheme from './hue/color/ColorScheme.js';

// ============================================================================
// Constants
// ============================================================================

const CONFIG = {
    path: {
        src:                './src',
        dist:               './dist',
        scss_input:         './src/scss',
        scss_output:        './dist/scss',
        css_output:         './dist/css',
        json_output:        './dist',
        ts_input:           './src/ts',
        ts_output:          './dist/ts',
        ts_output_icons:    './src/ts/icons',
        js_output:          './dist/js',
    },
};


// ============================================================================
// Functions
// ============================================================================

/**
 * Main function to orchestrate the various processes.
 * It handles SVG processing, font generation, SVG sprite generation, and SASS
 * processing.
 */
async function main() {

    try {


        // Init Logger
        // --------------------------------------------------------------------

        const logger = new StylizedLogger();


        // Install .gl libraries
        // --------------------------------------------------------------------

        logger.header('Install .gl libraries');
        // await gl_installer();


        // Dirs Clean
        // --------------------------------------------------------------------

        const directoryCleaner = new DirectoryCleaner();
        logger.header('Clean Directories');
        directoryCleaner.cleanDirectory(CONFIG.path.dist);
        logger.body(`Directory cleaned: ${CONFIG.path.dist}`);


        // Package JSON
        // --------------------------------------------------------------------

        const localPackageConfig = await readPackageJson('./package.json');
        const packageCreator = new PackageCreator(localPackageConfig);
        const packageConfig = packageCreator.config
        packageCreator.createPackageJson(CONFIG.path.dist);


        // SASS
        // --------------------------------------------------------------------

        const styleProcessor = new StyleProcessor();
        logger.header('Processing SASS...');
        // Process with expanded style
        await styleProcessor.processStyles(
            path.join(CONFIG.path.scss_input, 'index.scss'),
            path.join(CONFIG.path.css_output, `${packageConfig.name}.css`),
            'expanded'
        );
        // Process with compressed style
        await styleProcessor.processStyles(
            path.join(CONFIG.path.scss_input, 'index.scss'),
            path.join(CONFIG.path.css_output, `${packageConfig.name}.min.css`),
            'compressed'
        );
        logger.body('SASS Processing completed.');


        // Copy Files
        // --------------------------------------------------------------------

        const fileCopier = new FileCopier();
        fileCopier.copyFileToDirectory(
            path.join('.', 'README.md'),
            CONFIG.path.dist,
        )
        fileCopier.copyFileToDirectory(
            path.join('.', 'LICENSE'),
            CONFIG.path.dist,
        )


        // Copy Dirs
        // --------------------------------------------------------------------

        const directoryCopier = new DirectoryCopier();
        await directoryCopier.recursiveCopy(
            CONFIG.path.ts_input,
            CONFIG.path.ts_output,
        );
        console.log('Files copied successfully.');
        await directoryCopier.recursiveCopy(
            CONFIG.path.scss_input,
            CONFIG.path.scss_output,
        );
        console.log('Files copied successfully.');


        // Version
        // --------------------------------------------------------------------

        const versionWriter = new VersionWriter();
        await versionWriter.writeVersionToFile('VERSION', packageConfig.version);


        // // Compile TypeScript to JavaScript
        // // --------------------------------------------------------------------
        // const tsCompiler = new TypeScriptCompiler();
        // const tsFiles = [
        //     path.join(CONFIG.path.ts_input, 'index.ts'),
        // ];
        // const outputDir = './dist/js';
        // // console.log('Starting TypeScript compilation...');
        // await tsCompiler.compile(tsFiles, outputDir);
        // // console.log('TypeScript compilation completed.');
    

        // Rename Ts
        // --------------------------------------------------------------------

        // await fileRenamer.renameFile(
        //     path.join(CONFIG.path.js_output, 'index.js'),
        //     path.join(CONFIG.path.js_output, `${packageConfig.name}.js`),
        // )


        // // Minify JavaScript
        // // --------------------------------------------------------------------
        // const jsMinifier = new JavaScriptMinifier();
        // await jsMinifier.minifyFile(
        //     path.join(CONFIG.path.js_output, 'index.js'),
        //     path.join(CONFIG.path.js_output, `${packageConfig.name}.min.js`),
        // )
        // .then(() => console.log('JavaScript minification completed.'))
        // .catch(console.error);



        // // Create an instance of the SassDocGenerator
        // const sassDocGenerator = new SassDocGenerator();

        // // Define the source paths where your SASS/SCSS files are located
        // const sourcePaths = ['src/scss'];

        // // Define the destination directory where the generated documentation will be saved
        // const destDir = 'docs/sass';

        // // Additional SassDoc options (optional)
        // const options = {
        //     theme: 'default', // Example option to specify a theme
        //     display: {
        //         access: ['public', 'private'], // Document both public and private items
        //         alias: true,
        //         watermark: true,
        //     },
        // };

        // // Generate the documentation
        // sassDocGenerator.generateDocumentation(sourcePaths, destDir, options)
        //     .then(() => {
        //         console.log('Documentation generation complete.');
        //     })
        //     .catch(error => {
        //         console.error('Error generating documentation:', error);
        //     });






    } catch (error) {
        console.error('An error occurred:', error);
    }

}


// ============================================================================
// Main
// ============================================================================

// Execute the main function
main();
