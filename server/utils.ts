/**
 * Created by Karim Ouada on 18.12.2017.
 */

const bigInt = require("big-integer");
const _ = require("lodash");
const config = require('./config');


export const isPrime = (num: number) => {
    /*
    * Author: Saka7
    * Source: https://stackoverflow.com/questions/40200089/is-a-number-prime
    */
    for(let i = 2, s = Math.sqrt(num); i <= s; i++)
        if(num % i === 0) return false;
    return num !== 1;
};

export const gcd = (a: number, b: number) => {
    if ( ! b) {
        return a;
    }
    return gcd(b, a % b);
};

export const isCoprime = (a: number, b: number) => {
    return gcd(a, b) == 1
};

export const findPrimitives = (prime: number) => {
    let primitives = [];
    let values = {};
    let i = 0;
    while (primitives.length === 0 && i < prime){
        i += 1;
        for(let j = 1; j <= prime; j++){
            let val = bigInt(i).pow(j).mod(prime);
            values[j] = val;
            if(parseInt(val.toString()) === 1){
                if(j !== prime - 1){
                    break;
                } else {
                    primitives.push(i);
                }
            }
        }
    }
    let results = [];

    for (let key in values){
        if(isCoprime(prime - 1, parseInt(key))){
            if(results.indexOf(parseInt(values[key].toString())) === -1) results.push(parseInt(values[key].toString()));
        }
    }
    return _.sortBy(results);
};

export const findPrimes = (from: number, to: number) => {
    let results = [];
    for(let i = from; i < to; i++){
        if(isPrime(i)) results.push(i);
    }
    return results;
};

export const randomInt = (from: number, to: number) => {
    return Math.floor(Math.random() * (to - from + 1)) + from;
};

export const getRandomDiffieHellmanKeys = () => {
    let primes = findPrimes(config.primes.from, config.primes.to);
    let prime = primes[Math.floor(Math.random() * primes.length)];
    let primitives = findPrimitives(prime);
    let primitive = primitives[Math.floor(Math.random() * primitives.length)];
    let secret = randomInt(config.secret.from, config.secret.to);
    return {
        g: primitive,
        p: prime,
        b: secret
    }
};