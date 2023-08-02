class PerformanceCalculator {
  constructor(aPerformance) {
    this.performance = aPerformance;
  }
}

export default function createStatementData(invoice, plays) { // 중간 데이터 생성을 전담하는 함수
  const statementData = {};
  statementData.customer = invoice.customer; // 고객 데이터를 중간 데이터로 옮김
  statementData.performances = invoice.performances.map(enrichPerformance); // 공연 정보를 중간 데이터로 옮김
  statementData.totalAmount = totalAmount(statementData); // 총합을 계산하는 코드를 중간 데이터로 옮김
  statementData.totalVolumeCredits = totalVolumeCredits(statementData); // 총 포인트를 계산하는 코드를 중간 데이터로 옮김
  return statementData;

  function enrichPerformance(aPerformance) {
    const calculator = new PerformanceCalculator(aPerformance); // 공연료 계산기 생성
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