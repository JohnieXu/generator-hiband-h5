const generators = require('yeoman-generator');
const path = require('path');
const simpleGit = require('simple-git');
const download = require('download-git-repo');
const commandExists = require('command-exists').sync;
const child_process = require('child_process');

module.exports = class extends generators {
  constructor(args, opts) {
    super(args, opts);
    this.option('ts');
    this.scriptSuffix = this.options.ts ? '.ts' : '.js';
  }
  install() {
    console.log('install');
    // this.spawnCommand('yarn', ['init', '-y'])
  }
  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: '请输入项目名称(文件夹名称)',
        default: this.appname
      },
      {
        type: 'input',
        name: 'title',
        message: '请输入页面title',
        default: '标题'
      },
      {
        type: 'rawlist',
        name: 'type',
        message: '请选择H5页面类型',
        choices: ['static', 'app-h5', 'web-h5'],
        default: 'static'
      },
      {
        type: 'confirm',
        name: 'git',
        message: '是否初始化git？',
        default: false
      }
    ]);
  }
  paths() {
    const projectPath = path.resolve(this.destinationRoot(), this.answers.name);
    this.projectPath = projectPath;
  }
  async writing() {
    // this.fs.copyTpl(
    //   this.templatePath('index.html'),
    //   path.resolve(this.projectPath, 'index.html'),
    //   {
    //     title: this.answers.title
    //   }
    // )

    // 下载example项目：http://github.com/JohnieXu/hiband-h5-example.git
    let downloadRes = await download('JohnieXu/hiband-h5-example#master', this.answers.name, (err) => {
      if (err) {
        console.log(err);
        Promise.reject(err);
      }
      const hasYarn  = commandExists('yarn');
      this._installDependencies(hasYarn);
      Promise.resolve(true);
    });
    if (downloadRes) {
      this.spawnCommand('rm', ['-rf', `${this.answers.name}/.git`]);
    }
  }
  end() {
    if (this.answers.git) {
      this.gitInit(this.projectPath);
    }
  }
  _installDependencies(hasYarn) {
    const cwd = `${process.cwd()}/${this.answers.name}`;
    if (hasYarn) {
      child_process.spawn('yarn', { cwd });
    } else {
      child_process.spawn('npm', ['i'], { cwd })
    }
  }
  gitInit(path) {
    // FIXME: git的path为当前路径与yeoman的项目路径不一致，存在重复调用git命令的bug
    // const git = simpleGit(path);
    // git.init().add(`${process.cwd}/${this.answers.name} .`).commit('init');
  }
};
