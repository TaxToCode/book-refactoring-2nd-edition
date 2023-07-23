'use strict'

import plays from './plays.json' assert { type: 'json' }
import invoices from './invoices.json' assert { type: 'json' }

console.log(statement(invoices[0], plays))

// -------------------- 예제 바닐라 --------------------
// -------------------- 예제 바닐라 --------------------
// -------------------- 예제 바닐라 --------------------
function statementVanilla(invoice, plays) {
  let totalAmount = 0
  let volumeCredits = 0
  let result = `Statement for ${invoice.customer}\n`
  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format

  for (let perf of invoice.performances) {
    const play = plays[perf.playID]
    let thisAmount = 0

    switch (play.type) {
      case 'tragedy':
        thisAmount = 40000
        if (perf.audience > 30) {
          thisAmount += 1000 * (perf.audience - 30)
        }
        break
      case 'comedy':
        thisAmount = 30000
        if (perf.audience > 20) {
          thisAmount += 10000 + 500 * (perf.audience - 20)
        }
        thisAmount += 300 * perf.audience
        break
      default:
        throw new Error(`unknown type: ${play.type}`)
    }

    // add volume credits
    volumeCredits += Math.max(perf.audience - 30, 0)
    // add extra credit for every ten comedy attendees
    if ('comedy' === play.type) volumeCredits += Math.floor(perf.audience / 5)

    // print line for this order
    result += `  ${play.name}: ${format(thisAmount / 100)} (${perf.audience} seats)\n`
    totalAmount += thisAmount
  }
  result += `Amount owed is ${format(totalAmount / 100)}\n`
  result += `You earned ${volumeCredits} credits\n`
  return result
}

// -------------------- 실습 코드 --------------------
// -------------------- 실습 코드 --------------------
// -------------------- 실습 코드 --------------------
function playFor(aPerformance) {
  // 새로 playFor 함수 생성
  return plays[aPerformance.playID]
}

function amountFor(aPerformance) {
  let result = 0 // 변수 초기화
  switch (playFor(aPerformance).type) {
    case 'tragedy':
      result = 40000
      if (aPerformance.audience > 30) {
        result += 1000 * (aPerformance.audience - 30)
      }
      break
    case 'comedy':
      result = 30000
      if (aPerformance.audience > 20) {
        result += 10000 + 500 * (aPerformance.audience - 20)
      }
      result += 300 * aPerformance.audience
      break
    default:
      throw new Error(`unknown type: ${playFor(aPerformance).type}`)
  }
  return result
}

function volumeCreditsFor(aPerformance) {
  let result = 0
  result += Math.max(aPerformance.audience - 30, 0)
  if ('commedy' === playFor(aPerformance).type) {
    result += Math.floor(aPerformance.audience / 5)
  }
  return result
}

function usd(aNumber) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(aNumber / 100)
}

function statement(invoice) {
  let result = `Statement for ${invoice.customer}\n`

  function totalVolumeCredits() {
    let result = 0
    for (let perf of invoice.performances) {
      result += volumeCreditsFor(perf)
    }
    return result
  }

  function totalAmount() {
    let result = 0
    for (let pref of invoice.performances) {
      result += amountFor(pref)
    }
    return result
  }

  for (let perf of invoice.performances) {
    // print line for this order
    result += `  ${playFor(perf).name}: ${usd(amountFor(perf) / 100)} (${perf.audience} seats)\n`
  }

  result += `Amount owed is ${usd(totalAmount())}\n`
  result += `You earned ${totalVolumeCredits()} credits\n`
  return result
}
