;; ============================================
;; PACTUM ESCROW LOGIC CONTRACT
;; ============================================
;; Business logic for trustless freelance escrow
;; Calls into storage contract for data persistence
;; Can be replaced without losing data
;; ============================================

;; ============================================
;; CONSTANTS
;; ============================================

;; Review period: ~48 hours in Stacks blocks
;; In Nakamoto, stacks-block-height increments faster than pre-Nakamoto block-height.
;; Adjust this constant based on observed Nakamoto block production rate.
;; With ~1 block per 10 seconds: 48h * 3600s/h / 10s = 17280 blocks
(define-constant REVIEW_PERIOD_BLOCKS u17280)

;; Error codes
(define-constant ERR_UNAUTHORIZED (err u200))
(define-constant ERR_ESCROW_NOT_FOUND (err u201))
(define-constant ERR_ALREADY_FUNDED (err u202))
(define-constant ERR_NOT_FUNDED (err u203))
(define-constant ERR_NOT_DELIVERED (err u204))
(define-constant ERR_REVIEW_PERIOD_EXPIRED (err u205))
(define-constant ERR_INVALID_AMOUNT (err u206))
(define-constant ERR_ALREADY_COMPLETED (err u207))
(define-constant ERR_ALREADY_DISPUTED (err u208))
(define-constant ERR_INVALID_STATUS (err u209))
(define-constant ERR_SELF_ESCROW (err u210))
(define-constant ERR_REVIEW_PERIOD_ACTIVE (err u211))

;; ============================================
;; DATA VARIABLES
;; ============================================

;; Reference to storage contract (can be updated)
(define-data-var storage-contract principal .escrow-storage)

;; Treasury for dispute resolution (should be multi-sig or DAO in production)
(define-data-var treasury principal tx-sender)

;; ============================================
;; ADMIN FUNCTIONS
;; ============================================

(define-read-only (get-treasury)
  (var-get treasury)
)

(define-public (set-treasury (new-treasury principal))
  (begin
    (asserts! (is-eq contract-caller (var-get treasury)) ERR_UNAUTHORIZED)
    (ok (var-set treasury new-treasury))
  )
)