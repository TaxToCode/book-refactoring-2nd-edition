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
function statement(invoice) {
  return renderPlainText(createStatementData(invoice, plays));
}

function createStatementData(invoice, plays) { // 중간 데이터 생성을 전담하는 함수
  const statementData = {};
  statementData.customer = invoice.customer; // 고객 데이터를 중간 데이터로 옮김
  statementData.performances = invoice.performances.map(enrichPerformance); // 공연 정보를 중간 데이터로 옮김
  statementData.totalAmount = totalAmount(statementData); // 총합을 계산하는 코드를 중간 데이터로 옮김
  statementData.totalVolumeCredits = totalVolumeCredits(statementData); // 총 포인트를 계산하는 코드를 중간 데이터로 옮김
  return statementData;

  function enrichPerformance(aPerformance) {
    const result = Object.assign({}, aPerformance); // 얕은 복사 수행
    result.play = playFor(result); // 중간 데이터에 연극 정보를 저장
    result.amount = amountFor(result); // 중간 데이터에 비용을 계산해 저장
    result.volumeCredits = volumeCreditsFor(result); // 중간 데이터에 포인트를 계산해 저장
    return result;
  }

  function playFor(aPerformance) { // renderPlaintText()의 중첩 함수였던 playFor()를 statement()로 옮김
    return plays[aPerformance.playID]
  }

  function amountFor(aPerformance) {
    let result = 0 // 변수 초기화
    switch (aPerformance.play.type) {
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
        throw new Error(`unknown type: ${aPerformance.play.type}`)
    }
    return result
  }

  function volumeCreditsFor(aPerformance) {
    let result = 0
    result += Math.max(aPerformance.audience - 30, 0)
    if ('commedy' === aPerformance.play.type) {
      result += Math.floor(aPerformance.audience / 5)
    }
    return result
  }

  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0);
  }

  function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
  }
}

function renderPlainText(data, plays) { // 중간 데이터 구조를 인수로 전달
  let result = `Statement for ${data.customer}\n`
  for (let perf of data.performances) {
    // print line for this order
    result += `  ${perf.play.name}: ${usd(perf.amount / 100)} (${perf.audience} seats)\n`
  }
  result += `Amount owed is ${usd(data.totalAmount)}\n`
  result += `You earned ${data.totalVolumeCredits} credits\n`
  return result

  function usd(aNumber) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(aNumber / 100)
  }
}