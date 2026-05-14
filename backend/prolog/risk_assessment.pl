%% ============================================================
%% AURA — Risk Assessment Rules
%% File: risk_assessment.pl
%%
%% Detects actionable risk factors from a request's parameters.
%% Returns a LIST of flags (multiple can fire for one request).
%%
%% Predicates:
%%   is_risk_flag(+Road, +Pop, +Category, +Stock, -Flag)
%%   get_all_flags(+Road, +Pop, +Category, +Stock, -Flags)
%% ============================================================


%% ─── Risk Flag Rules ────────────────────────────────────────
%% NOTE: Do NOT use ! (cut) here.
%% We WANT all matching rules to fire so we get all risk flags.

is_risk_flag(blocked, _, _, _,
    "ROAD BLOCKED: Consider aerial drop or boat delivery.").

is_risk_flag(_, large, medicine, _,
    "LARGE POPULATION + MEDICINE: Coordinate multiple distribution points.").

is_risk_flag(_, _, _, empty,
    "ZERO STOCK: Raise immediate resupply order — do not wait.").

is_risk_flag(partial, large, _, _,
    "PARTIAL ACCESS + LARGE CROWD: Deploy motorbike couriers for last mile.").

is_risk_flag(_, large, food, empty,
    "FOOD SHORTAGE (LARGE): Risk of civil unrest — prioritise security escort.").

is_risk_flag(blocked, large, _, _,
    "LARGE ISOLATED POPULATION: Notify District Secretariat and NDRRMC immediately.").

is_risk_flag(blocked, _, medicine, _,
    "MEDICINE + BLOCKED ROADS: Coordinate with nearest hospital for emergency dispatch.").


%% ─── Flag Collector ─────────────────────────────────────────
%% get_all_flags(+Road, +Pop, +Category, +Stock, -Flags)
%% Uses findall to collect ALL matching flags into a list.
%% If no flags match, Flags = [].

get_all_flags(Road, Pop, Category, Stock, Flags) :-
    findall(
        Flag,
        is_risk_flag(Road, Pop, Category, Stock, Flag),
        Flags
    ).


%% ─── TEST QUERIES ────────────────────────────────────────────
%% ?- get_all_flags(blocked, large, medicine, empty, F).
%%    Expected: F = [multiple flags list].
%% ?- get_all_flags(clear, small, food, available, F).
%%    Expected: F = [].
%% ?- halt.