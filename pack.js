module.exports = {
    tasks: [
        { name: 'Build', action: 'build', options: { minify: true } },
        { name: 'Test', action: 'test' },
        { name: 'Package', action: 'package', options: { format: 'zip' } },
    ],
};