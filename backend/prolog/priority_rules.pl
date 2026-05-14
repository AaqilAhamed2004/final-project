%% ============================================================
%% AURA — Priority Classification Rules
%% File: priority_rules.pl
%%
%% Determines the relief priority level for incoming requests.
%% Called from Python via pyswip.
%%
%% Predicate:
%%   assign_priority(+Category, +RoadStatus, +PopSize, +StockLevel, -Priority)
%%
%% Inputs:
%%   Category   : medicine | food | shelter | other
%%   RoadStatus : blocked | partial | clear
%%   PopSize    : large | medium | small
%%   StockLevel : empty | low | available
%%
%% Output:
%%   Priority   : red | orange | yellow
%% ============================================================


%% ─── RED RULES (Critical — act immediately) ────────────────

%% Medicine + roads blocked → RED (patients cannot reach hospital)
assign_priority(medicine, blocked, _, _, red) :- !.

%% Medicine + zero stock → RED (no supply available at all)
assign_priority(medicine, _, _, empty, red) :- !.

%% Medicine + large population + low stock → RED (will run out fast)
assign_priority(medicine, _, large, low, red) :- !.

%% Food + blocked roads + large population → RED (mass starvation risk)
assign_priority(food, blocked, large, _, red) :- !.

%% Any category + blocked roads + zero stock → RED
assign_priority(_, blocked, _, empty, red) :- !.


%% ─── ORANGE RULES (Urgent — act within hours) ───────────────

%% Medicine + low stock (roads clear) → ORANGE
assign_priority(medicine, _, _, low, orange) :- !.

%% Medicine + partially blocked roads → ORANGE
assign_priority(medicine, partial, _, _, orange) :- !.

%% Food + large population (roads not blocked) → ORANGE
assign_priority(food, _, large, _, orange) :- !.

%% Food + blocked roads (smaller population) → ORANGE
assign_priority(food, blocked, _, _, orange) :- !.

%% Food + partial roads → ORANGE
assign_priority(food, partial, _, _, orange) :- !.

%% Shelter + blocked roads → ORANGE (people exposed to elements)
assign_priority(shelter, blocked, _, _, orange) :- !.

%% Any category + partial roads + empty stock → ORANGE
assign_priority(_, partial, _, empty, orange) :- !.


%% ─── YELLOW RULES (Standard — schedule within days) ─────────

%% Shelter with accessible roads → YELLOW
assign_priority(shelter, _, _, _, yellow) :- !.

%% Food with clear roads and stock available → YELLOW
assign_priority(food, clear, _, available, yellow) :- !.

%% Other category → YELLOW
assign_priority(other, _, _, _, yellow) :- !.


%% ─── DEFAULT FALLBACK ────────────────────────────────────────
%% If no rule above matched, default to yellow (safe fallback)
assign_priority(_, _, _, _, yellow).


%% ─── TEST QUERIES (run manually in: swipl priority_rules.pl) ─
%% ?- assign_priority(medicine, blocked, large, empty, P).
%%    Expected: P = red.
%% ?- assign_priority(medicine, clear, small, low, P).
%%    Expected: P = orange.
%% ?- assign_priority(food, clear, medium, available, P).
%%    Expected: P = yellow.
%% ?- assign_priority(shelter, blocked, large, low, P).
%%    Expected: P = orange.
%% ?- halt.