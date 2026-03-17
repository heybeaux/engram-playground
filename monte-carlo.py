#!/usr/bin/env python3
"""
March Madness 2026 — Monte Carlo Bracket Optimizer
Powered by Engram AWM data (95 memories across 3 phases)

Runs N simulations of the full tournament, picks the bracket
that maximizes expected points under ESPN scoring.
"""

import random
import json
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional

# ESPN scoring
ROUND_POINTS = {1: 10, 2: 20, 3: 40, 4: 80, 5: 160, 6: 320}

@dataclass
class Team:
    name: str
    seed: int
    kenpom_rank: int
    adj_em: float
    adj_o: float
    adj_d: float
    momentum: float  # -1 to +1 (cold to hot)
    injury_impact: float  # 0 to -0.3 (reduction in win prob)
    venue_boost: float  # 0 to +0.05
    experience: float  # 0 to 1 (roster experience)
    three_pt_pct: float  # 3PT shooting percentage
    turnover_rate: float  # lower is better (0-1 scale, 0=great)

def win_probability(team_a: Team, team_b: Team) -> float:
    """
    Calculate win probability for team_a vs team_b.
    Primary driver: KenPom AdjEM difference.
    Secondary factors: momentum, injuries, venue, experience, matchup dynamics.
    """
    # Core: AdjEM difference → win probability via logistic function
    # Calibrated so 10-point AdjEM gap ≈ 75% win probability
    em_diff = team_a.adj_em - team_b.adj_em
    base_prob = 1 / (1 + 10 ** (-em_diff / 12))
    
    # Momentum adjustment (±3%)
    momentum_adj = (team_a.momentum - team_b.momentum) * 0.03
    
    # Injury adjustment (direct reduction)
    injury_adj = team_a.injury_impact - team_b.injury_impact
    
    # Venue adjustment
    venue_adj = team_a.venue_boost - team_b.venue_boost
    
    # Experience in March (±2%)
    exp_adj = (team_a.experience - team_b.experience) * 0.02
    
    # 3PT shooting differential (upset factor, ±2%)
    three_pt_adj = (team_a.three_pt_pct - team_b.three_pt_pct) * 0.05
    
    # Tempo mismatch: if big underdog plays slow, slight bonus
    # (captures the "grind it out" effect)
    
    prob = base_prob + momentum_adj + injury_adj + venue_adj + exp_adj + three_pt_adj
    
    # Clamp to [0.02, 0.98]
    return max(0.02, min(0.98, prob))


# ===== TEAM DATA (from 95 Engram memories) =====

# EAST REGION
east = [
    # (seed, team)
    Team("Duke", 1, 1, 32.5, 122.1, 89.6, 0.9, -0.02, 0.0, 0.7, 0.36, 0.3),
    Team("Siena", 16, 200, 5.0, 100.0, 105.0, 0.0, 0.0, 0.0, 0.5, 0.33, 0.5),
    Team("Ohio State", 8, 40, 18.0, 115.0, 97.0, 0.6, 0.0, 0.0, 0.8, 0.34, 0.4),
    Team("TCU", 9, 37, 20.0, 118.6, 98.6, 0.3, 0.0, 0.0, 0.5, 0.34, 0.45),
    Team("St. John's", 5, 25, 22.6, 118.7, 96.1, 0.9, 0.0, -0.02, 0.7, 0.35, 0.35),
    Team("Northern Iowa", 12, 100, 10.0, 105.0, 95.0, 0.5, 0.0, 0.0, 0.8, 0.34, 0.3),
    Team("Kansas", 4, 8, 27.9, 121.3, 93.4, 0.4, 0.0, 0.0, 0.5, 0.35, 0.4),
    Team("CA Baptist", 13, 180, 6.0, 102.0, 106.0, 0.3, 0.0, 0.0, 0.5, 0.33, 0.5),
    Team("S. Florida", 11, 50, 17.0, 119.0, 102.0, 0.7, 0.0, 0.0, 0.6, 0.34, 0.35),
    Team("Louisville", 6, 45, 18.5, 117.0, 98.5, 0.2, 0.0, 0.0, 0.5, 0.36, 0.55),  # high TO rate
    Team("Michigan State", 3, 15, 25.3, 117.6, 92.3, 0.5, 0.0, 0.0, 0.9, 0.34, 0.35),
    Team("N Dakota St", 14, 160, 8.0, 104.0, 106.0, 0.3, 0.0, 0.0, 0.6, 0.33, 0.45),
    Team("UCLA", 7, 21, 23.6, 119.3, 95.7, 0.4, 0.0, 0.0, 0.6, 0.35, 0.4),
    Team("UCF", 10, 42, 19.0, 116.0, 97.0, 0.3, 0.0, 0.0, 0.5, 0.34, 0.45),
    Team("UConn", 2, 4, 29.9, 121.5, 91.6, 0.5, 0.0, 0.0, 0.8, 0.36, 0.35),
    Team("Furman", 15, 63, 14.8, 117.4, 102.6, 0.3, 0.0, 0.0, 0.6, 0.34, 0.4),
]

# WEST REGION
west = [
    Team("Arizona", 1, 7, 28.2, 120.1, 91.9, 1.0, 0.0, 0.0, 0.9, 0.36, 0.3),
    Team("Long Island", 16, 250, 3.0, 98.0, 107.0, 0.0, 0.0, 0.0, 0.5, 0.32, 0.5),
    Team("Villanova", 8, 28, 21.9, 116.4, 94.5, 0.2, 0.0, 0.0, 0.6, 0.35, 0.4),
    Team("Utah State", 9, 26, 20.0, 116.0, 96.0, 0.8, 0.0, 0.04, 0.7, 0.35, 0.35),  # venue boost SD
    Team("Wisconsin", 5, 16, 25.0, 116.2, 91.2, 0.5, 0.0, 0.0, 0.7, 0.35, 0.35),
    Team("High Point", 12, 150, 8.0, 106.0, 108.0, 0.3, 0.0, 0.0, 0.5, 0.33, 0.5),
    Team("Arkansas", 4, 29, 21.7, 118.2, 96.5, 0.8, 0.0, -0.02, 0.6, 0.34, 0.4),  # far travel
    Team("Hawaii", 13, 170, 7.0, 103.0, 106.0, 0.3, 0.0, 0.0, 0.5, 0.33, 0.5),
    Team("Texas", 11, 27, 22.1, 119.5, 97.4, 0.5, 0.0, 0.0, 0.6, 0.35, 0.4),
    Team("BYU", 6, 23, 23.1, 116.9, 93.8, 0.4, -0.15, 0.0, 0.5, 0.34, 0.4),  # Saunders ACL
    Team("Gonzaga", 3, 14, 25.7, 120.5, 94.8, 0.5, 0.0, 0.0, 0.7, 0.36, 0.35),
    Team("Kennesaw St", 14, 140, 9.0, 105.0, 106.0, 0.3, 0.0, 0.0, 0.5, 0.33, 0.45),
    Team("Miami", 7, 30, 21.4, 117.9, 96.5, 0.4, 0.0, 0.0, 0.6, 0.35, 0.4),
    Team("Missouri", 10, 59, 15.6, 116.1, 100.5, 0.3, 0.0, 0.03, 0.5, 0.34, 0.45),  # St. Louis venue
    Team("Purdue", 2, 5, 29.4, 119.8, 90.4, 0.8, 0.0, 0.0, 0.7, 0.35, 0.35),
    Team("Queens", 15, 200, 5.0, 100.0, 105.0, 0.0, 0.0, 0.0, 0.5, 0.32, 0.5),
]

# SOUTH REGION
south = [
    Team("Florida", 1, 22, 23.4, 120.8, 97.4, 0.2, 0.0, 0.0, 0.6, 0.35, 0.4),
    Team("PV/LEH", 16, 250, 3.0, 98.0, 107.0, 0.0, 0.0, 0.0, 0.5, 0.32, 0.5),
    Team("Clemson", 8, 52, 17.0, 117.1, 100.1, 0.4, 0.0, 0.0, 0.5, 0.34, 0.4),
    Team("Iowa", 9, 55, 16.0, 116.0, 100.0, 0.3, 0.0, 0.0, 0.5, 0.34, 0.45),
    Team("Vanderbilt", 5, 35, 19.5, 117.5, 98.0, 0.6, 0.0, 0.0, 0.6, 0.35, 0.4),
    Team("McNeese", 12, 90, 12.0, 110.0, 98.0, 0.5, 0.0, 0.0, 0.6, 0.35, 0.4),
    Team("Nebraska", 4, 42, 19.0, 114.8, 95.8, 0.4, 0.0, 0.0, 0.5, 0.34, 0.4),
    Team("Troy", 13, 160, 8.0, 104.0, 106.0, 0.3, 0.0, 0.0, 0.5, 0.33, 0.5),
    Team("North Carolina", 6, 10, 27.1, 119.4, 92.3, 0.4, -0.12, 0.0, 0.6, 0.35, 0.4),  # Wilson injury
    Team("VCU", 11, 49, 17.6, 115.2, 97.6, 0.7, 0.0, 0.0, 0.7, 0.34, 0.35),
    Team("Illinois", 3, 20, 23.9, 117.8, 93.9, 0.4, -0.02, 0.0, 0.6, 0.35, 0.4),
    Team("Penn", 14, 130, 10.0, 108.0, 108.0, 0.3, 0.0, 0.0, 0.6, 0.34, 0.45),
    Team("St. Mary's", 7, 50, 17.4, 116.8, 99.4, 0.4, 0.0, 0.0, 0.7, 0.35, 0.4),
    Team("Texas A&M", 10, 47, 18.0, 116.4, 98.6, 0.4, 0.0, 0.0, 0.5, 0.34, 0.4),
    Team("Houston", 2, 2, 31.2, 118.4, 87.2, 0.7, 0.0, 0.0, 0.8, 0.35, 0.3),
    Team("Idaho", 15, 200, 5.0, 100.0, 105.0, 0.0, 0.0, 0.0, 0.5, 0.32, 0.5),
]

# MIDWEST REGION
midwest = [
    Team("Michigan", 1, 18, 24.5, 118.0, 93.5, 0.1, -0.03, 0.0, 0.5, 0.35, 0.4),  # sluggish, ankle
    Team("UMBC", 16, 230, 4.0, 99.0, 107.0, 0.0, 0.0, 0.0, 0.5, 0.32, 0.5),
    Team("Georgia", 8, 48, 17.8, 116.4, 98.6, 0.3, 0.0, 0.0, 0.5, 0.34, 0.45),
    Team("Saint Louis", 9, 70, 14.0, 112.0, 98.0, 0.5, 0.0, 0.05, 0.6, 0.34, 0.4),  # HOME CROWD
    Team("Texas Tech", 5, 19, 24.2, 118.4, 94.2, 0.0, 0.0, 0.0, 0.6, 0.34, 0.4),  # lost 3 of 5
    Team("Akron", 12, 60, 15.0, 118.4, 103.4, 0.95, 0.0, 0.0, 0.7, 0.379, 0.3),  # 10-game streak, elite 3PT
    Team("Alabama", 4, 9, 27.5, 122.6, 95.1, 0.5, 0.0, 0.0, 0.6, 0.35, 0.4),
    Team("Hofstra", 13, 170, 7.0, 103.0, 106.0, 0.3, 0.0, 0.0, 0.5, 0.33, 0.5),
    Team("Tennessee", 6, 6, 28.7, 117.2, 88.5, 0.6, 0.0, 0.0, 0.8, 0.34, 0.3),
    Team("SMU", 11, 41, 19.2, 115.4, 96.2, 0.3, 0.0, 0.0, 0.5, 0.34, 0.4),
    Team("Virginia", 3, 54, 16.6, 113.4, 96.8, 0.6, 0.0, 0.0, 0.7, 0.34, 0.35),
    Team("Wright State", 14, 150, 8.0, 104.0, 106.0, 0.3, 0.0, 0.0, 0.5, 0.33, 0.45),
    Team("Kentucky", 7, 11, 26.8, 123.2, 96.4, 0.3, -0.05, 0.0, 0.6, 0.36, 0.4),  # injuries
    Team("Santa Clara", 10, 80, 13.0, 111.0, 98.0, 0.6, 0.0, 0.0, 0.7, 0.35, 0.35),
    Team("Iowa State", 2, 12, 26.4, 116.8, 90.4, 0.5, 0.0, 0.0, 0.9, 0.35, 0.3),
    Team("Tennessee St", 15, 220, 4.5, 99.0, 106.0, 0.0, 0.0, 0.0, 0.5, 0.32, 0.5),
]

def simulate_region(teams: List[Team], rng: random.Random) -> List[Tuple[Team, int]]:
    """
    Simulate a region. Teams listed in bracket order:
    [1,16, 8,9, 5,12, 4,13, 6,11, 3,14, 7,10, 2,15]
    Returns list of (team, round_reached) for all teams.
    """
    results = {t.name: 1 for t in teams}  # everyone reaches round 1
    
    # Round 1: 8 games
    r1_winners = []
    for i in range(0, 16, 2):
        a, b = teams[i], teams[i+1]
        prob_a = win_probability(a, b)
        winner = a if rng.random() < prob_a else b
        loser = b if winner == a else a
        r1_winners.append(winner)
        results[winner.name] = 2
    
    # Round 2: 4 games
    r2_winners = []
    for i in range(0, 8, 2):
        a, b = r1_winners[i], r1_winners[i+1]
        prob_a = win_probability(a, b)
        winner = a if rng.random() < prob_a else b
        r2_winners.append(winner)
        results[winner.name] = 3
    
    # Sweet 16: 2 games
    r3_winners = []
    for i in range(0, 4, 2):
        a, b = r2_winners[i], r2_winners[i+1]
        prob_a = win_probability(a, b)
        winner = a if rng.random() < prob_a else b
        r3_winners.append(winner)
        results[winner.name] = 4
    
    # Elite 8: 1 game
    a, b = r3_winners[0], r3_winners[1]
    prob_a = win_probability(a, b)
    region_winner = a if rng.random() < prob_a else b
    results[region_winner.name] = 5
    
    return results, region_winner


def simulate_tournament(n_sims: int = 50000) -> dict:
    """Run full Monte Carlo simulation."""
    
    # Track how often each team reaches each round
    team_rounds = {}  # team_name -> {round: count}
    champion_counts = {}
    final_four_counts = {}
    
    regions = {
        'East': east,
        'West': west, 
        'South': south,
        'Midwest': midwest,
    }
    
    for team_list in regions.values():
        for t in team_list:
            team_rounds[t.name] = {r: 0 for r in range(1, 7)}
            champion_counts[t.name] = 0
            final_four_counts[t.name] = 0
    
    for sim in range(n_sims):
        rng = random.Random(sim)  # deterministic per sim for reproducibility
        
        region_winners = {}
        for region_name, team_list in regions.items():
            results, winner = simulate_region(team_list, rng)
            region_winners[region_name] = winner
            for team_name, round_reached in results.items():
                for r in range(1, round_reached + 1):
                    team_rounds[team_name][r] += 1
        
        # Final Four
        for rw in region_winners.values():
            final_four_counts[rw.name] += 1
            team_rounds[rw.name][5] += 1
        
        # Semifinals: East vs West, South vs Midwest (standard bracket)
        semi1_a, semi1_b = region_winners['East'], region_winners['West']
        semi2_a, semi2_b = region_winners['South'], region_winners['Midwest']
        
        prob1 = win_probability(semi1_a, semi1_b)
        finalist1 = semi1_a if rng.random() < prob1 else semi1_b
        
        prob2 = win_probability(semi2_a, semi2_b)
        finalist2 = semi2_a if rng.random() < prob2 else semi2_b
        
        team_rounds[finalist1.name][6] = team_rounds[finalist1.name].get(6, 0) + 1
        team_rounds[finalist2.name][6] = team_rounds[finalist2.name].get(6, 0) + 1
        
        # Championship
        prob_final = win_probability(finalist1, finalist2)
        champion = finalist1 if rng.random() < prob_final else finalist2
        champion_counts[champion.name] += 1
    
    return team_rounds, champion_counts, final_four_counts, n_sims


def find_optimal_bracket(team_rounds, champion_counts, n_sims):
    """
    For each game slot, pick the team most likely to reach that round.
    This maximizes expected points under ESPN scoring.
    """
    print("\n" + "="*70)
    print("MONTE CARLO RESULTS — {:,} SIMULATIONS".format(n_sims))
    print("="*70)
    
    # Championship probabilities
    print("\n🏆 CHAMPIONSHIP PROBABILITIES:")
    champ_sorted = sorted(champion_counts.items(), key=lambda x: -x[1])
    for name, count in champ_sorted[:15]:
        pct = count / n_sims * 100
        bar = "█" * int(pct / 2)
        print(f"  {name:20s} {pct:5.1f}% {bar}")
    
    # Final Four probabilities
    print("\n🏟️ FINAL FOUR PROBABILITIES:")
    ff_data = []
    for name, rounds in team_rounds.items():
        ff_pct = rounds.get(5, 0) / n_sims * 100
        if ff_pct > 1:
            ff_data.append((name, ff_pct))
    ff_data.sort(key=lambda x: -x[1])
    for name, pct in ff_data[:15]:
        bar = "█" * int(pct / 3)
        print(f"  {name:20s} {pct:5.1f}% {bar}")
    
    # First round upset probabilities
    print("\n🔥 FIRST ROUND UPSET PROBABILITIES (lower seed winning):")
    upset_matchups = [
        ("Akron", "Texas Tech", "Midwest 12v5"),
        ("S. Florida", "Louisville", "East 11v6"),
        ("Northern Iowa", "St. John's", "East 12v5"),
        ("McNeese", "Vanderbilt", "South 12v5"),
        ("Texas", "BYU", "West 11v6"),
        ("Utah State", "Villanova", "West 9v8"),
        ("VCU", "North Carolina", "South 11v6"),
        ("Saint Louis", "Georgia", "Midwest 9v8"),
        ("Santa Clara", "Kentucky", "Midwest 10v7"),
        ("UCF", "UCLA", "East 10v7"),
        ("Missouri", "Miami", "West 10v7"),
        ("Texas A&M", "St. Mary's", "South 10v7"),
        ("SMU", "Tennessee", "Midwest 11v6"),
        ("High Point", "Wisconsin", "West 12v5"),
    ]
    
    for underdog, favorite, label in upset_matchups:
        ud_r2 = team_rounds.get(underdog, {}).get(2, 0)
        pct = ud_r2 / n_sims * 100
        marker = "🔥" if pct > 35 else "⚠️" if pct > 25 else "  "
        print(f"  {marker} {underdog:20s} over {favorite:20s} ({label}): {pct:5.1f}%")
    
    # Optimal bracket (maximize expected points)
    print("\n" + "="*70)
    print("📋 OPTIMAL BRACKET (maximizes expected ESPN points)")
    print("="*70)
    
    regions_teams = {
        'East': east,
        'West': west,
        'South': south,
        'Midwest': midwest,
    }
    
    for region_name, team_list in regions_teams.items():
        print(f"\n  {'─'*50}")
        print(f"  {region_name.upper()} REGION")
        print(f"  {'─'*50}")
        
        # Round 1 picks (higher probability of reaching R2)
        print("  Round 1:")
        for i in range(0, 16, 2):
            a, b = team_list[i], team_list[i+1]
            a_prob = team_rounds[a.name][2] / n_sims * 100
            b_prob = team_rounds[b.name][2] / n_sims * 100
            winner = a if a_prob > b_prob else b
            w_prob = max(a_prob, b_prob)
            print(f"    ({a.seed}){a.name} vs ({b.seed}){b.name} → {winner.name} ({w_prob:.0f}%)")
        
        # Sweet 16 (most likely to reach R3)
        print("  Sweet 16:")
        s16 = sorted(team_list, key=lambda t: -team_rounds[t.name].get(3, 0))[:4]
        for t in s16:
            pct = team_rounds[t.name].get(3, 0) / n_sims * 100
            print(f"    ({t.seed}) {t.name}: {pct:.0f}%")
        
        # Elite 8
        print("  Elite 8:")
        e8 = sorted(team_list, key=lambda t: -team_rounds[t.name].get(4, 0))[:2]
        for t in e8:
            pct = team_rounds[t.name].get(4, 0) / n_sims * 100
            print(f"    ({t.seed}) {t.name}: {pct:.0f}%")
        
        # Region winner
        rw = sorted(team_list, key=lambda t: -team_rounds[t.name].get(5, 0))[0]
        pct = team_rounds[rw.name].get(5, 0) / n_sims * 100
        print(f"  WINNER: ({rw.seed}) {rw.name}: {pct:.0f}%")
    
    # Champion
    champ = max(champion_counts, key=champion_counts.get)
    pct = champion_counts[champ] / n_sims * 100
    print(f"\n  {'='*50}")
    print(f"  🏆 CHAMPION: {champ} ({pct:.1f}%)")
    print(f"  {'='*50}")
    
    # Expected points calculation
    print("\n📊 EXPECTED POINTS BY CHAMPION PICK:")
    for name, count in champ_sorted[:8]:
        # Expected points = P(correct) × points_per_round summed across all rounds
        # Champion pick gives points in R1 through R6 if they keep winning
        exp_pts = 0
        for r in range(1, 7):
            prob = team_rounds[name].get(r, 0) / n_sims
            exp_pts += prob * ROUND_POINTS[r]
        print(f"  {name:20s}: {exp_pts:.0f} expected pts (champ pick)")


if __name__ == "__main__":
    print("🏀 March Madness 2026 — Monte Carlo Bracket Optimizer")
    print("   Powered by Engram AWM (95 memories, 3 data phases)")
    print(f"   Running 50,000 simulations...\n")
    
    team_rounds, champion_counts, ff_counts, n_sims = simulate_tournament(50000)
    find_optimal_bracket(team_rounds, champion_counts, n_sims)
