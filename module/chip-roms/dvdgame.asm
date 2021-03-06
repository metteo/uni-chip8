; -------------------------------------------------------------------------------------------------------------------- ;
; Chip-8 DVD Game                                                                                                      ;
; Copyright (C) 2019 Kyle Saburao                                                                                      ;
; - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -;
; This program was designed to be assembled with https://github.com/wernsey/chip8                                      ;
; -------------------------------------------------------------------------------------------------------------------- ;
define SCRATCH_ZERO V0
define SCRATCH_ONE V1
define SCRATCH_TWO V2
define SCRATCH_THREE V9
define DVD_X V3
define DVD_Y V4
define DVD_VELOCITY V7
define SCORE V8
define KEY_PRESS_COOLDOWN VB

define DVD_LEFT_SPRITE_WIDTH #8
define DVD_RIGHT_SPRITE_WIDTH #3
define DVD_SPRITE_HEIGHT #7

define DVD_COORD_MIN #0
define DVD_X_MAX #35
define DVD_Y_MAX #19
define MAX_SCORE #5
define KEY_PRESS_WAIT #2D
define TRUE #1
define FALSE #0

define SCORE_X #8
define SCORE_Y #4
define SCORE_HEIGHT #5
define COOLDOWN_X #D
define COOLDOWN_Y #7
define COOLDOWN_HEIGHT #2
define LOOP_WAIT_TIME #2

define RND_MASK #7
define LEFT_KEY #1
define RIGHT_KEY #2

; -------------------------------------------------------------------

init:
    CLS
    CALL init_dvd
    CALL init_score

    JP loop

loop:
    CALL key_input
    CALL dvd_movement
    CALL scoring
    CLS
    CALL render_dvd
    CALL render_score
    CALL render_cooldown

    SNE SCORE, MAX_SCORE
    JP game_win

    CALL decrement_key_wait

    LD SCRATCH_ZERO, LOOP_WAIT_TIME
    LD DT, SCRATCH_ZERO
    CALL wait

    JP loop

; -------------------------------------------------------------------

init_key_press:
    LD KEY_PRESS_COOLDOWN, #0
    RET

init_dvd:
    LD DVD_X, #1F
    LD DVD_Y, #A
    RET

init_score:
    LD SCORE, #0
    RET

; -------------------------------------------------------------------

decrement_key_wait:
    SNE KEY_PRESS_COOLDOWN, #0
    RET ; Early exit

    LD SCRATCH_ZERO, KEY_PRESS_COOLDOWN
    LD SCRATCH_ONE, LOOP_WAIT_TIME
    CALL less_than

    SNE SCRATCH_TWO, #1
    JP decrement_key_wait_one

    decrement_key_wait_chunk:
        LD SCRATCH_ZERO, LOOP_WAIT_TIME
        JP decrement_key_wait_timer

    decrement_key_wait_one:
        LD SCRATCH_ZERO, #1
        
    decrement_key_wait_timer:
        SUB KEY_PRESS_COOLDOWN, SCRATCH_ZERO

    RET

scoring:

    ; Pass y-axis test
    SNE DVD_Y, #0
    JP scoring_x

    SNE DVD_Y, DVD_Y_MAX
    JP scoring_x

    JP scoring_exit

    ; Pass x-axis test
    scoring_x:
        SNE DVD_X, #0
        JP scoring_score

        SNE DVD_X, DVD_X_MAX
        JP scoring_score

        JP scoring_exit

        scoring_score:
            LD SCRATCH_THREE, #2D
            LD ST, SCRATCH_THREE
            ADD SCORE, #1

    scoring_exit:
        RET

score_increase:
    ADD SCORE, #1
    LD SCRATCH_ZERO, #2
    LD ST, SCRATCH_ZERO
    RET

; -------------------------------------------------------------------

render_dvd:
    LD SCRATCH_ONE, DVD_X
    LD SCRATCH_TWO, DVD_Y
    
    LD I, sprite_dvd_left
    DRW SCRATCH_ONE, SCRATCH_TWO, DVD_SPRITE_HEIGHT

    LD I, sprite_dvd_right
    ADD SCRATCH_ONE, DVD_LEFT_SPRITE_WIDTH
    DRW SCRATCH_ONE, SCRATCH_TWO, DVD_SPRITE_HEIGHT

    RET

render_score:
    LD F, SCORE
    LD SCRATCH_ZERO, SCORE_X
    LD SCRATCH_ONE, SCORE_Y
    DRW SCRATCH_ZERO, SCRATCH_ONE, SCORE_HEIGHT
    RET

render_cooldown:
    SNE KEY_PRESS_COOLDOWN, FALSE
    RET
    LD I, sprite_cooldown
    LD SCRATCH_ZERO, COOLDOWN_X
    LD SCRATCH_ONE, COOLDOWN_Y
    DRW SCRATCH_ZERO, SCRATCH_ONE, COOLDOWN_HEIGHT
    RET

; -------------------------------------------------------------------

key_input:

    SE KEY_PRESS_COOLDOWN, #0
    RET


    LD SCRATCH_ZERO, LEFT_KEY
    SKP SCRATCH_ZERO
    JP key_input_left_continue

    key_input_left:
        SNE DVD_X, #0
        JP key_input_left_continue

        CALL set_dvd_dx_neg
        LD KEY_PRESS_COOLDOWN, KEY_PRESS_WAIT

    key_input_left_continue:

    LD SCRATCH_ZERO, RIGHT_KEY
    SKP SCRATCH_ZERO
    JP key_input_right_continue

    key_input_right:
        SNE DVD_X, DVD_X_MAX
        JP key_input_right_continue

        CALL set_dvd_dx_pos
        LD KEY_PRESS_COOLDOWN, KEY_PRESS_WAIT

    key_input_right_continue:

    RET

dvd_movement:

    dvd_movement_dx:

        CALL is_dvd_dx_pos
        SE SCRATCH_ZERO, #1
        JP dvd_movement_dx_neg

        dvd_movement_dx_pos:
            ADD DVD_X, #1
            JP dvd_movement_dy
        dvd_movement_dx_neg:
            LD SCRATCH_ZERO, #1
            SUB DVD_X, SCRATCH_ZERO
            JP dvd_movement_dy

    dvd_movement_dy:

        CALL is_dvd_dy_pos
        SE SCRATCH_ZERO, #1
        JP dvd_movement_dy_neg

        dvd_movement_dy_pos:
            ADD DVD_Y, #1
            JP dvd_movement_bounce
        dvd_movement_dy_neg:
            LD SCRATCH_ZERO, #1
            SUB DVD_Y, SCRATCH_ZERO
            JP dvd_movement_bounce

    dvd_movement_bounce:

        ; Top wall
        dvd_bounce_top:
            SE DVD_Y, #0
            JP dvd_bounce_bottom
            CALL bounce_sound

            CALL set_dvd_dy_pos

        ; Bottom wall
        dvd_bounce_bottom:
            SE DVD_Y, DVD_Y_MAX
            JP dvd_bounce_left
            CALL bounce_sound

            CALL set_dvd_dy_neg

        ; Left wall
        dvd_bounce_left:
            SE DVD_X, #0
            JP dvd_bounce_right
            CALL bounce_sound

            CALL set_dvd_dx_pos

        ; Right wall
        dvd_bounce_right:
            SE DVD_X, DVD_X_MAX
            JP dvd_movement_exit
            CALL bounce_sound

            CALL set_dvd_dx_neg

    dvd_movement_exit:
        RET

bounce_sound:
    LD SCRATCH_ZERO, #2
    LD ST, SCRATCH_ZERO
    RET

; -------------------------------------------------------------------

game_win:
    LD I, sprite_win_left
    LD SCRATCH_ZERO, #17
    LD SCRATCH_ONE, #F
    DRW SCRATCH_ZERO, V1, #4
    LD I, sprite_win_right
    LD SCRATCH_ZERO, #1F
    DRW SCRATCH_ZERO, V1, #4
    LD SCRATCH_ZERO, #5A
    LD DT, SCRATCH_ZERO
    LD ST, SCRATCH_ZERO
    CALL wait
    JP init

; -------------------------------------------------------------------

; S2 = S0 < S1
less_than:
    SUB SCRATCH_ZERO, SCRATCH_ONE
    SNE VF, #1
    JP less_than_false ; No carry

    less_than_true:
        LD SCRATCH_TWO, #1
        RET

    less_than_false:
        LD SCRATCH_TWO, #0
        RET

; Reserve S0
wait:
    wait_loop:
        LD SCRATCH_ZERO, DT
        SE SCRATCH_ZERO, #0
        JP wait_loop
    RET

; -------------------------------------------------------------------

set_dvd_dx_pos:
	LD SCRATCH_ZERO, #10
	OR DVD_VELOCITY, SCRATCH_ZERO
	RET

set_dvd_dx_neg:
	LD SCRATCH_ZERO, #1
	AND DVD_VELOCITY, SCRATCH_ZERO
	RET

set_dvd_dy_pos:
	LD SCRATCH_ZERO, #1
	OR DVD_VELOCITY, SCRATCH_ZERO
	RET

set_dvd_dy_neg:
	LD SCRATCH_ZERO, #10
	AND DVD_VELOCITY, SCRATCH_ZERO
	RET

; S0 = dx pos
is_dvd_dx_pos:
	LD SCRATCH_ZERO, DVD_VELOCITY
	LD SCRATCH_ONE, #10
	AND SCRATCH_ZERO, SCRATCH_ONE

	SE SCRATCH_ZERO, #10
	JP is_dvd_dx_pos_false

	is_dvd_dx_pos_true:
		LD SCRATCH_ZERO, #1
		RET

	is_dvd_dx_pos_false:
		LD SCRATCH_ZERO, #0

	RET

; S0 = dy pos
is_dvd_dy_pos:
	LD SCRATCH_ZERO, DVD_VELOCITY
	LD SCRATCH_ONE, #1
	AND SCRATCH_ZERO, SCRATCH_ONE
	RET

; SPRITES -----------------------------------------------------------

sprite_dvd_left:
	db
	#ca,
	#aa,
	#c4,
	#0,
	#7f,
	#f1,
	#7f

sprite_dvd_right:
	db
	#c0,
	#a0,
	#c0,
	#0,
	#c0,
	#e0,
	#c0

sprite_win_left:
	db
	#ab,
	#a9,
	#a9,
	#53

sprite_win_right:
	db
	#ba,
	#2a,
	#28,
	#aa

sprite_cooldown:
    db
    #40,
    #e0
    
