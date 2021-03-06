module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            files: ['_/*.js','_/**/*.scss', '_/*.rb', "**/*.html"],
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
        uglify:{
            minified:{
                options: {
                    banner: '/*' + 
                            '<%= pkg.name %>.<%= pkg.version %>.js | ' +
                            '<%= pkg.author %> | ' +
                            '<%= grunt.template.today("yyyy-mm-dd") %>' +
                            '*/'
                },
                files:{
                    'js/<%= pkg.name %>.<%= pkg.version %>.min.js':['bond.js']
                }
            }
        },
        concat:{
            options: {
                stripBanners: true, 
                banner:     '/*' + 
                            '<%= pkg.name %>.<%= pkg.version %>.js | ' +
                            '<%= pkg.author %> | ' +
                            '<%= grunt.template.today("yyyy-mm-dd") %>' +
                            '*/'
            },
            dist: {
                src: ['bond.js'],
                dest: 'js/<%= pkg.name %>.<%= pkg.version %>.js'
            },
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('export', ['compass:dev', 'uglify:minified', 'concat']);

};

