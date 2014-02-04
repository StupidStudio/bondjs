module.exports = function (grunt) {

    grunt.initConfig({
        watch: {
            files: ['*.html','*.js','**/*.scss', '*.rb'],
            tasks: ['compass:dev'],
            options: {
                livereload:true
            }
        },
        compass: {
            dev: {
                options: {
                    config: 'config.rb'
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.registerTask('default', ['watch']);

};


