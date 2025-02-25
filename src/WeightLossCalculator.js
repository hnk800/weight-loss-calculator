import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WeightLossCalculator = () => {
  // 状態変数の定義
  const [weight, setWeight] = useState('70');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('30');
  const [height, setHeight] = useState('170');
  const [activityLevel, setActivityLevel] = useState(1.2);
  const [targetDays, setTargetDays] = useState('30');
  const [targetWeightLoss, setTargetWeightLoss] = useState('3');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // 活動レベル係数の説明
  const activityLevels = [
    { value: 1.2, label: '座り仕事中心（ほとんど運動なし）' },
    { value: 1.375, label: '軽い運動（週1-3回）' },
    { value: 1.55, label: '中程度の運動（週3-5回）' },
    { value: 1.725, label: '活発な運動（週6-7回）' },
    { value: 1.9, label: '非常に活発（肉体労働や1日2回トレーニング）' }
  ];

  // 結果の計算
  const calculateResults = () => {
    // 文字列から数値への変換
    const weightNum = parseFloat(weight) || 0;
    const heightNum = parseFloat(height) || 0;
    const ageNum = parseInt(age) || 0;
    const targetDaysNum = parseInt(targetDays) || 0;
    const targetWeightLossNum = parseFloat(targetWeightLoss) || 0;
    
    // 入力値の検証
    if (weightNum <= 0 || heightNum <= 0 || ageNum <= 0 || targetDaysNum <= 0 || targetWeightLossNum <= 0) {
      setError('すべての値は正の値である必要があります');
      return;
    }

    if (targetWeightLossNum > weightNum * 0.15) {
      setError(`安全な減量は体重の15%以下（${(weightNum * 0.15).toFixed(1)}kg）を推奨します`);
      return;
    }

    setError('');

    // 基礎代謝（BMR）の計算 - ハリス・ベネディクト方程式
    let bmr;
    if (gender === 'male') {
      // 男性: BMR = 66 + (13.7 × 体重kg) + (5 × 身長cm) - (6.8 × 年齢)
      bmr = 66 + (13.7 * weightNum) + (5 * heightNum) - (6.8 * ageNum);
    } else {
      // 女性: BMR = 655 + (9.6 × 体重kg) + (1.8 × 身長cm) - (4.7 × 年齢)
      bmr = 655 + (9.6 * weightNum) + (1.8 * heightNum) - (4.7 * ageNum);
    }

    // 総消費カロリー（TDEE）の計算
    const tdee = bmr * activityLevel;

    // 減量に必要なカロリー計算（7200kcal/kg）
    const totalDeficitNeeded = targetWeightLossNum * 7200;
    const dailyDeficitNeeded = totalDeficitNeeded / targetDaysNum;

    // 1日の目標摂取カロリー
    const dailyCalorieTarget = tdee - dailyDeficitNeeded;

    // 安全チェック（1日1200kcal未満は非推奨）
    const isSafe = dailyCalorieTarget >= 1200;

    // 実現可能な日数を計算（1日1200kcalの場合）
    const feasibleDays = isSafe ? targetDaysNum : totalDeficitNeeded / (tdee - 1200);

    setResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyDeficit: Math.round(dailyDeficitNeeded),
      dailyCalorieTarget: Math.round(dailyCalorieTarget),
      isSafe,
      feasibleDays: Math.ceil(feasibleDays),
      weightNum,
      targetWeightLossNum,
      targetDaysNum
    });
  };

  // フォーム送信処理
  const handleSubmit = (e) => {
    e.preventDefault();
    calculateResults();
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">減量計画カロリー計算機</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-medium">性別</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2 border rounded bg-white"
              >
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block font-medium">年齢 (歳)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="10"
                max="100"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium">身長 (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="100"
                max="250"
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block font-medium">体重 (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="30"
                max="300"
                step="0.1"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-medium">運動強度</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
              className="w-full p-2 border rounded bg-white"
            >
              {activityLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label} (係数: {level.value})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-medium">目標減量期間 (日)</label>
              <input
                type="number"
                value={targetDays}
                onChange={(e) => setTargetDays(e.target.value)}
                min="7"
                max="365"
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block font-medium">目標減量 (kg)</label>
              <input
                type="number"
                value={targetWeightLoss}
                onChange={(e) => setTargetWeightLoss(e.target.value)}
                min="0.5"
                max="50"
                step="0.1"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              計算する
            </button>
          </div>

          {error && <div className="text-red-500 text-center font-medium">{error}</div>}

          {results && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">計算結果</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-medium">基礎代謝量 (BMR)</h4>
                  <p className="text-xl">{results.bmr} kcal/日</p>
                  <p className="text-sm text-gray-500">何も活動しなくても消費するカロリー</p>
                </div>
                
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-medium">1日総消費カロリー (TDEE)</h4>
                  <p className="text-xl">{results.tdee} kcal/日</p>
                  <p className="text-sm text-gray-500">基礎代謝 × 活動レベル</p>
                </div>
              </div>

              <div className="mt-4 bg-white p-3 rounded shadow">
                <h4 className="font-medium">1日の必要カロリー制限</h4>
                <p className="text-xl">{results.dailyDeficit} kcal/日</p>
                <p className="text-sm text-gray-500">
                  {results.targetWeightLossNum}kgの減量には総計 {Math.round(results.targetWeightLossNum * 7200)} kcal 
                  の消費が必要 ({results.targetDaysNum}日で割った値)
                </p>
              </div>

              <div className="mt-4 bg-white p-3 rounded shadow">
                <h4 className="font-medium">1日の目標カロリー摂取量</h4>
                <p className={`text-2xl font-bold ${results.isSafe ? 'text-green-600' : 'text-red-500'}`}>
                  {results.dailyCalorieTarget} kcal/日
                </p>
                
                {!results.isSafe && (
                  <div className="mt-2 text-red-500">
                    <p>⚠️ この摂取量は健康的な最低推奨量（1200kcal）を下回っています</p>
                    <p>より安全な減量計画: {results.feasibleDays}日間で{targetWeightLoss}kg減量</p>
                    <p>または目標を下げて、より少ない減量目標を設定してください</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default WeightLossCalculator;
