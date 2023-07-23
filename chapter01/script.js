'use strict';

import plays from './plays.json' assert { type: 'json' };
import invoices from './invoices.json' assert { type: 'json' };

console.log(statement(invoices[0], plays));

// ---------- 00. 예제 바닐라 ----------
function statementVanilla(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `Statement for ${invoice.customer}\n`;
  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format;

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    let thisAmount = 0;

    switch (play.type) {
      case 'tragedy':
        thisAmount = 40000;
        if (perf.audience > 30) {
          thisAmount += 1000 * (perf.audience - 30);
        }
        break;
      case 'comedy':
        thisAmount = 30000;
        if (perf.audience > 20) {
          thisAmount += 10000 + 500 * (perf.audience - 20);
        }
        thisAmount += 300 * perf.audience;
        break;
      default:
        throw new Error(`unknown type: ${play.type}`);
    }

    // add volume credits
    volumeCredits += Math.max(perf.audience - 30, 0);
    // add extra credit for every ten comedy attendees
    if ('comedy' === play.type) volumeCredits += Math.floor(perf.audience / 5);

    // print line for this order
    result += `  ${play.name}: ${format(thisAmount / 100)} (${
      perf.audience
    } seats)\n`;
    totalAmount += thisAmount;
  }
  result += `Amount owed is ${format(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;
  return result;
}

// ---------- 01. statement() 함수 쪼개기 (Extract Function) ----------

// 값이 바뀌지 않는 변수는 매개변수로 전달
// function amountFor(aPerformance, play) {
//   let result = 0; // 변수 초기화
//   switch (play.type) {
//     case 'tragedy':
//       result = 40000;
//       if (aPerformance.audience > 30) {
//         result += 1000 * (aPerformance.audience - 30);
//       }
//       break;
//     case 'comedy':
//       result = 30000;
//       if (aPerformance.audience > 20) {
//         result += 10000 + 500 * (aPerformance.audience - 20);
//       }
//       result += 300 * aPerformance.audience;
//       break;
//     default:
//       throw new Error(`unknown type: ${play.type}`);
//   }
//   return result;
// }

// function statement(invoice, plays) {
//   let totalAmount = 0;
//   let volumeCredits = 0;
//   let result = `Statement for ${invoice.customer}\n`;
//   const format = new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: 'USD',
//     minimumFractionDigits: 2,
//   }).format;

//   for (let perf of invoice.performances) {
//     const play = plays[perf.playID];
//     const thisAmount = amountFor(perf, play); // 추출한 함수를 이용

//     // add volume credits
//     volumeCredits += Math.max(perf.audience - 30, 0);
//     // add extra credit for every ten comedy attendees
//     if ('comedy' === play.type) volumeCredits += Math.floor(perf.audience / 5);

//     // print line for this order
//     result += `  ${play.name}: ${format(thisAmount / 100)} (${
//       perf.audience
//     } seats)\n`;
//     totalAmount += thisAmount;
//   }
//   result += `Amount owed is ${format(totalAmount / 100)}\n`;
//   result += `You earned ${volumeCredits} credits\n`;
//   return result;
// }

// ---------- 02. 임의 변수를 질의 함수로 바꾸기 (Replace Temp With Query)----------

function playFor(aPerformance) {
  // 새로 playFor 함수 생성
  return plays[aPerformance.playID];
}

function amountFor(aPerformance) {
  let result = 0; // 변수 초기화
  switch (playFor(aPerformance).type) {
    case 'tragedy':
      result = 40000;
      if (aPerformance.audience > 30) {
        result += 1000 * (aPerformance.audience - 30);
      }
      break;
    case 'comedy':
      result = 30000;
      if (aPerformance.audience > 20) {
        result += 10000 + 500 * (aPerformance.audience - 20);
      }
      result += 300 * aPerformance.audience;
      break;
    default:
      throw new Error(`unknown type: ${playFor(aPerformance).type}`);
  }
  return result;
}

function statement(invoice) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `Statement for ${invoice.customer}\n`;
  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format;

  for (let perf of invoice.performances) {
    const thisAmount = amountFor(perf); // 추출한 함수를 이용

    // add volume credits
    volumeCredits += Math.max(perf.audience - 30, 0);
    // add extra credit for every ten comedy attendees
    if ('comedy' === playFor(perf).type)
      volumeCredits += Math.floor(perf.audience / 5);

    // print line for this order
    result += `  ${playFor(perf).name}: ${format(thisAmount / 100)} (${
      perf.audience
    } seats)\n`;
    totalAmount += thisAmount;
  }
  result += `Amount owed is ${format(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;
  return result;
}
