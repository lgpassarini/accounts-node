const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs');

operation();

function operation() {
    inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'O que você quer fazer?',
        choices: [
            'Criar Conta',
            'Saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]
    })
    .then(answer => {
        const action = answer.action;

        switch (action) {
            case 'Criar Conta':
                createAccount();
            break;
            case 'Saldo':
                getAccountBalance();
            break;
            case 'Depositar':
                deposit();
            break;
            case 'Sacar':
                withdraw();
            break;
            case 'Sair':
                console.log(chalk.bgBlue.black("Até logo!"));
                process.exit();
            break;
        }
    })
    .catch(err => {
        console.log(chalk.bgRed.bold(err));
    });
}

function createAccount() {
    console.clear();
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'));
    console.log(chalk.blue('Defina as opções da sua conta a seguir'));

    buildAccount();
}

function buildAccount() {
    inquirer.prompt({
        message: 'Digite o nome para a sua conta:',
        name: 'accountName'
    })
    .then(answer => {

        const accountName = answer.accountName;

        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts');
        }

        if (accountExists(accountName)) {
            console.log(chalk.bgRed.bold("Já existe uma aconta com esse nome!"));
            buildAccount();
            return;
        }

        fs.writeFileSync(`./accounts/${accountName}.json`, '{"balance": 0}', (err) => {
            console.log(chalk.bgRed.bold(err));
        })

        console.clear();
        console.log(chalk.bgGreen.bold(`Sucesso! Sua conta '${accountName}' foi criada.`));
        operation();

    })
    .catch(err => {
        console.log(chalk.bgRed.bold(err));
        return;
    });
}

function deposit() {
    inquirer.prompt({
        message: 'Para qual conta você quer depositar?',
        name: 'accountName'
    })
    .then(answer => {

        const accountName = answer.accountName;

        if(!accountExists(accountName)) {
            console.clear();
            console.log(chalk.bgRed.bold(`Desculpa, a conta '${accountName}' não existe na nossa base de dados.`));
            deposit();
            return;
        }

        inquirer.prompt({
            message: 'Qual o valor do depósito?',
            name: 'amount'
        })
        .then(answer => {

            addAmount(accountName, answer.amount);
            operation();

        })
        .catch(err => {
            console.log(chalk.bgRed.bold(err));
        })


    })
    .catch(err => {
        console.log(chalk.bgRed.bold(err));
    })
}

function withdraw() {
    inquirer.prompt({
        message: 'De qual conta você quer sacar?',
        name: 'accountName'
    })
    .then(answer => {

        const accountName = answer.accountName;

        if(!accountExists(accountName)) {
            console.clear();
            console.log(chalk.bgRed.bold(`Desculpa, a conta '${accountName}' não existe na nossa base de dados.`));
            withdraw();
            return;
        }

        inquirer.prompt({
            message: 'Qual o valor do saque?',
            name: 'amount'
        })
        .then(answer => {

            subtractAmount(accountName, answer.amount);
            operation();

        })
        .catch(err => {
            console.log(chalk.bgRed.bold(err));
        })


    })
    .catch(err => {
        console.log(chalk.bgRed.bold(err));
    })
}

function getAccountBalance() {

    inquirer.prompt({
        message: 'Qual o nome da sua conta?',
        name: "accountName"
    })
    .then(answer => {

        const accountName = answer.accountName;

        if (!accountExists(accountName)){
            console.log(chalk.bgRed.bold(`Desculpa, a conta '${accountName}' não existe na nossa base de dados.`));
            operation();
            return;
        }

        const account = returnAccountJson(accountName);

        console.clear();
        console.log(chalk.blue(`Seu saldo atual é de $${account.balance}`));
        operation();
    })
    .catch(err => {
        console.log(chalk.bgRed.bold(err));
    })

}

function addAmount(accountName, amount) {

    if (!amount) {
        console.log(chalk.bgRed.bold('Dados Inválidos!'));
        deposit();
        return;
    }

    const account = returnAccountJson(accountName);

    account.balance = parseFloat(account.balance) + parseFloat(amount);

    fs.writeFileSync(
        `accounts/${accountName}.json`, 
        JSON.stringify(account), 
        err => console.log(chalk.bgRed.bold(err))
    );

    console.clear();
    console.log(chalk.blue(`Foram adicionados $${amount} para a conta '${accountName}'`));

}

function subtractAmount(accountName, amount) {

    if (!amount) {
        console.clear();
        console.log(chalk.bgRed.bold('Dados Inválidos!'));
        withdraw();
        return;
    }

    const account = returnAccountJson(accountName);

    if (parseFloat(amount) > parseFloat(account.balance)) {
        console.clear();
        console.log(chalk.bgRed.bold('Desculpe, saldo insuficiente!'));
        withdraw();
        return;
    }

    account.balance = parseFloat(account.balance) - parseFloat(amount);

    fs.writeFileSync(
        `accounts/${accountName}.json`, 
        JSON.stringify(account), 
        err => console.log(chalk.bgRed.bold(err))
    );

    console.clear();
    console.log(chalk.blue(`Foram removidos $${amount} da conta '${accountName}'`));
}

function accountExists(accountName) {
    return fs.existsSync(`accounts/${accountName}.json`);
}

function returnAccountJson(accountName) {
    return JSON.parse(fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    }))
}