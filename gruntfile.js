module.exports = function (grunt) {

    grunt.initConfig({
        watch: {
                files: ['*.html','*.js'],
                options: {
                    livereload:true
                }

        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['watch']);

};
