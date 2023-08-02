class PerformanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performance = aPerformance;
    this.play = aPlay;
  }

  get amount() {
    throw new Error('서브클래스로 옮겼음');
  }

  get volumeCredits() {
    let result = 0;
    result += Math.max(this.performance.audience - 30, 0);
    if ('commedy' === this.play.type) {
      result += Math.floor(this.performance.audience / 5);
    }
    return result;
  }
}

function createPerformanceCalculator(aPerformance, aPlay) {
  switch (aPlay.type) {
    case 'tragedy':
      return new TragedyCalculator(aPerformance, aPlay);
    case 'comedy':
      return new ComedyCalculator(aPerformance, aPlay);
    default:
      throw new Error(`알 수 없는 장르: ${aPlay.type}`);
  }
}

class TragedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 40000;
    if (this.performance.audience > 30) {
      result += 1000 * (this.performance.audience - 30);
    }
    return result;
  }
}

class ComedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 30000;
    if (this.performance.audience > 20) {
      result += 10000 + 500 * (this.performance.audience - 20);
    }
    result += 300 * this.performance.audience;
    return result;
  }
}

export default function createStatementData(invoice, plays) {
  // 중간 데이터 생성을 전담하는 함수
  const statementData = {};
  statementData.customer = invoice.customer; // 고객 데이터를 중간 데이터로 옮김
  statementData.performances = invoice.performances.map(enrichPerformance); // 공연 정보를 중간 데이터로 옮김
  statementData.totalAmount = totalAmount(statementData); // 총합을 계산하는 코드를 중간 데이터로 옮김
  statementData.totalVolumeCredits = totalVolumeCredits(statementData); // 총 포인트를 계산하는 코드를 중간 데이터로 옮김
  return statementData;

  function enrichPerformance(aPerformance) {
    const calculator = createPerformanceCalculator(aPerformance, playFor(aPerformance)); // 공연료 계산기 생성
    const result = Object.assign({}, aPerformance); // 얕은 복사 수행
    result.play = calculator.play; // 중간 데이터에 연극 정보를 저장
    result.amount = calculator.amount; // 중간 데이터에 비용을 계산해 저장
    result.volumeCredits = calculator.volumeCredits; // 중간 데이터에 포인트를 계산해 저장
    return result;
  }

  function playFor(aPerformance) {
    // renderPlaintText()의 중첩 함수였던 playFor()를 statement()로 옮김
    return plays[aPerformance.playID];
  }

  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0);
  }

  function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
  }
}
