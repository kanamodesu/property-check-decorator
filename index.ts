import {rule} from './rule';

const BLACKLIST = [
    '佐藤',
    '優美清春香菜'
];

class User {
    @rule(age => 18 <= age && age <= 60, 'Value is out of range 18~60')
    age: number;

    @rule(name => name !== '', 'Value is must not be empty')
    @rule(name => !BLACKLIST.includes(name), 'This user is included in blacklist')
    name: string;

    constructor(age: number, name: string) {
        this.age = age;
        this.name = name;
    }
}

const user = new User(18, '田中');

user.age = 5;           // Error: (in property of User.age) Value is out of range 18~60: 5
// user.name = '佐藤';  // Error: (in property of User.name) This user is included in blacklist: "佐藤"
// user.name = '';      // Error: (in property of User.name) Value is must not be empty:
