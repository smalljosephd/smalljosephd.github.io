'Application program for Bootstrap ARDL Bounds Testing

'Bootstrap procedure imposes H0 in DGP
'Sample program arguments:
' lnPEX lnDEBT lnDEBT2 OILP lnPCY 1 1981 2020 1000

'Program code for "Threshold analysis of the public debt-expenditure nexus in Nigeria: Evidence from Bootstrap ARDL

'Program arguments:
' %0 = LHS series (y);
' %1 = RHS series (x);
' %2 = lag length (!maxlag);
' %3 = first obs in latest beginning series;
' %4 = last obs in earliest ending series;
' Obtain %0 to %4 from empirical workfile
' %5 = Number of replications in bootstrap (!nrep)

' ## As the sample ending at year 2012, maximum no of %5 = number of replications in bootstrap (!nrep) is limited to 7900

'### if the number of replications in the bootstrap >7900, say 20,000 we need to change the workfile structure to undated/undated to (nrep + maxlag+1 = 20,000+3+1=20,005), this probably will take around 1 hour)

' --------------------------------------------------------------------------------------------------------------------------------------------

' //////////////////////////////////////////////////// DEFINE YOUR DUMMIES HERE ////////////////////////////////////////////////////////////

'%6="dum96"					'%6, %7, %8, %9 = list of deterministic components for MODEL Y;
'%7="dum09"
'%8="dum91"
' %9="dum82"

'%10="dum85" 				'%10, %11, %12, %13 = list of deterministic components for MODEL X
'%11="dum09"
' %12="dum05"
' %13="dum??"

'---------------------------------------------------------------------------------------------------------------------------------------------

!nrep = 2000
!maxlag = 1

'start copy 1. this part move up from below
%beg_extra=@otod(@dtoo("1981")-20) 			' extra obs at beginning to discard; only to be used to generate extra bootstrap obs
pagestruct(start=%beg_extra) 					' extends workfile range to accommodate 20 extra obs at beginning
%start_up=@otod(@dtoo(%beg_extra)+5)
!start1=@dtoo(%start_up)-1
scalar check_start1=!start1

!1st=@dtoo("1980")+(!maxlag+1) 					'!1st is first obs number in estimation; in {%3} { } needed to convert string to date
%1st=@otod(!1st) 									'date form of 1st
!2nd=@dtoo("1981")+1 									'!2nd is second obs number read into program
%2nd=@otod(!2nd) 									'date form of !2nd
!last=@dtoo("2020") 										'numerical value of last obs

scalar check_1st=!1st
scalar check_beg_extra={%beg_extra}

scalar check_startup={%start_up}
' following commands resize workfile to hold series of size = !nrep
%date_first=@otod(@dtoo("1981")+!maxlag+1)
%rep_last=@otod(@dtoo(%date_first)+!nrep)
if @dtoo(%rep_last) > @dtoo("2020") then
pagestruct(end=%rep_last) 						'extends workfile range to match number of replications
endif

series y_F_stat_b 									'series that holds the values of the ardl f-statistics from each replication
series y_dv_t_stat_b 								'series that holds the values of the ardl dependent variable t-statistics from each replication
series y_idv_t_stat_b 								'series that holds the values of the ardl independent variable t-statistics from each replication

smpl @all
y_F_stat_b.fill(l,s) NA 								'clears y_f_stat if it already exists in workfile
y_dv_t_stat_b.fill(l,s) NA 							'clears y_dv_t_stat if it already exists in workfile
y_idv_t_stat_b.fill(l,s) NA 							'clears y_idv_t_stat if it already exists in workfile

!nobs = "2020" - {%1st} + 1
scalar check_nobs = !nobs

series y=y
series x=x
series x1=x1
series x2=x2
series x3=x3
'series x4=x4
'series x5=x5

genr dy=d(y)
genr dx=d(x)
genr dx1=d(x1)
genr dx2=d(x2)
genr dx3=d(x3)
'genr dx4=d(x4)
'genr dx5=d(x5)

' =================== EMPIRICAL MODELS (UNRESTRICTED MODEL) =====================

' ----------------------------------------------------------- Unrestricted Model Y ---------------------------------------------------

group det_grp {%6} {%7} {%8} {%9} 						'group of deterministic components for MODEL Y
!num_det=det_grp.@count
!coef_num=5*!maxlag+6 + !num_det 						'number of coefficients total
!coef_num_no_det=5*!maxlag+6 							'number of coefficients, excluding deterministics
!coef_num_max=5*!maxlag+10 								'maximum number of coefficients, allowing up to four deterministics
scalar check_coef_num=!coef_num
scalar check_num_det=!num_det

vector(!coef_num_max) eq_y_coefs = 0 					'sets number of parameters in one equation;
smpl %1st "2020" 													'estimation sample
if !maxlag = 0 then
equation ARDL_empirical_y.ls dy c y(-1) x(-1) x1(-1) x2(-1) x3(-1) {%6} {%7} {%8} {%9}
else
equation ARDL_empirical_y.ls dy c y(-1) x(-1) x1(-1) x2(-1) x3(-1) dy(-!maxlag) dx(0) dx1(0) dx2(0) dx3(0) {%6} {%7} {%8} {%9} 'dy(-1 to -!maxlag)' dx(-1 to -!maxlag) {%6} {%7} {%8} {%9} 
endif

ARDL_empirical_y.makeresids resids_y

' Values of F- and t stats are saved in tables called empirical_y.
freeze(mode=overwrite, empirical_F) ARDL_empirical_y.wald c(2)=c(3)=c(4)=c(5)=c(6)=0
freeze(mode=overwrite, empirical_F2) ARDL_empirical_y.wald c(3)=c(4)=c(5)=c(6)=0
scalar F_wald_y = @val(empirical_F(6,2))
scalar t_eqy_y = ARDL_empirical_y.@tstats(2)
scalar f2_eqy_x = @val(empirical_F2(6,2))
'scalar t_eqy_x = ARDL_empirical_y.@tstats(3)

for !ic = 1 to !coef_num
eq_y_coefs(!ic) = ARDL_empirical_y.@coefs(!ic)
next

' ----------------------------------------------------------- Unrestricted Model X ---------------------------------------------------
group det_grpx {%10} {%11} {%12} {%13} 			'group of deterministic components for MODEL X
!num_detx = det_grpx.@count
!coef_numx=5*!maxlag+6 + !num_detx 				'number of coefficients total
!coef_num_no_detx=5*!maxlag+6 						'number of coefficients, excluding deterministics
!coef_num_maxx=5*!maxlag+10 							'maximum number of coefficients, allowing up to four deterministics
scalar check_coef_numx=!coef_numx
scalar check_num_detx=!num_detx

vector(!coef_num_maxx) eq_x_coefs = 0 				'sets number of parameters in one equation;
smpl %1st "2020" 												'estimation sample
if !maxlag = 0 then
equation ARDL_empirical_x.ls dx c y(-1) x(-1) x1(-1) x2(-1) x3(-1) {%10} {%11} {%12} {%13}
else
equation ARDL_empirical_x.ls dx c y(-1) x(-1) x1(-1) x2(-1) x3(-1) dy(-!maxlag) dx(0) dx1(0) dx2(0) dx3(0) {%10} {%11} {%12} 'dy(-1 to -!maxlag) dx(-1 to -!maxlag) {%10} {%11} {%12} {%13}
endif

ARDL_empirical_x.makeresids resids_x

' Values of F- and t stats are saved in tables called empirical_x.

freeze(mode=overwrite, empiricalx_F) ARDL_empirical_x.wald c(2)=c(3)=c(4)=c(5)=c(6)=0
freeze(mode=overwrite, empiricalx_F2) ARDL_empirical_x.wald c(3)=c(4)=c(5)=c(6)=0
scalar F_wald_x = @val(empiricalx_F(6,2))
scalar t_eqx_y = ARDL_empirical_x.@tstats(2)
scalar f2_eqx_x = @val(empiricalx_F2(6,2))
'scalar t_eqx_x = ARDL_empirical_x.@tstats(3)

for !ic = 1 to !coef_numx
eq_x_coefs(!ic) = ARDL_empirical_x.@coefs(!ic)
next

' ----------------------------------------------------------- Unrestricted Model X1 ---------------------------------------------------
group det_grpx1 {%10} {%11} {%12} {%13} 			'group of deterministic components for MODEL X3
!num_detx1 = det_grpx1.@count
!coef_numx1=5*!maxlag+6 + !num_detx1 				'number of coefficients total
!coef_num_no_detx1=5*!maxlag+6 						'number of coefficients, excluding deterministics
!coef_num_maxx1=5*!maxlag+10 							'maximum number of coefficients, allowing up to four deterministics
scalar check_coef_numx1=!coef_numx1
scalar check_num_detx1=!num_detx1

vector(!coef_num_maxx1) eq_x1_coefs = 0 				'sets number of parameters in one equation;
smpl %1st "2020" 												'estimation sample
if !maxlag = 0 then
equation ARDL_empirical_x1.ls dx1 c y(-1) x(-1) x1(-1) x2(-1) x3(-1) {%10} {%11} {%12} {%13}
else
equation ARDL_empirical_x1.ls dx1 c y(-1) x(-1) x1(-1) x2(-1) x3(-1) dy(-!maxlag) dx(0) dx1(0) dx2(0) dx3(0) {%10} {%11} {%12} 'dy(-1 to -!maxlag) dx(-1 to -!maxlag) {%10} {%11} {%12} {%13}
endif

ARDL_empirical_x1.makeresids resids_x1				

' Values of F- and t stats are saved in tables called empirical_x1.

freeze(mode=overwrite, empiricalx1_F) ARDL_empirical_x1.wald c(2)=c(3)=c(4)=c(5)=c(6)=0
freeze(mode=overwrite, empiricalx1_F2) ARDL_empirical_x1.wald c(3)=c(4)=c(5)=c(6)=0
scalar F_wald_x1 = @val(empiricalx1_F(6,2))
scalar t_eqx1_y = ARDL_empirical_x1.@tstats(2)
scalar f2_eqx1_x = @val(empiricalx1_F2(6,2))
'scalar t_eqx1_x = ARDL_empirical_x1.@tstats(3)

for !ic = 1 to !coef_numx1
eq_x1_coefs(!ic) = ARDL_empirical_x1.@coefs(!ic)
next

' ----------------------------------------------------------- Unrestricted Model X2 ---------------------------------------------------
group det_grpx2 {%10} {%11} {%12} {%13} 			'group of deterministic components for MODEL X2
!num_detx2 = det_grpx2.@count
!coef_numx2=5*!maxlag+6 + !num_detx2 				'number of coefficients total
!coef_num_no_detx2=5*!maxlag+6 						'number of coefficients, excluding deterministics
!coef_num_maxx2=5*!maxlag+10 							'maximum number of coefficients, allowing up to four deterministics
scalar check_coef_numx2=!coef_numx2
scalar check_num_detx2=!num_detx2

vector(!coef_num_maxx2) eq_x2_coefs = 0 				'sets number of parameters in one equation;
smpl %1st "2020" 												'estimation sample
if !maxlag = 0 then
equation ARDL_empirical_x2.ls dx2 c y(-1) x(-1) x1(-1) x2(-1) x3(-1) {%10} {%11} {%12} {%13}
else
equation ARDL_empirical_x2.ls dx2 c y(-1) x(-1) x1(-1) x2(-1) x3(-1) dy(-!maxlag) dx(0) dx1(0) dx2(0) dx3(0) {%10} {%11} {%12} 'dy(-1 to -!maxlag) dx(-1 to -!maxlag) {%10} {%11} {%12} {%13}
endif

ARDL_empirical_x2.makeresids resids_x2				

' Values of F- and t stats are saved in tables called empirical_x2.

freeze(mode=overwrite, empiricalx2_F) ARDL_empirical_x2.wald c(2)=c(3)=c(4)=c(5)=c(6)=0
freeze(mode=overwrite, empiricalx2_F2) ARDL_empirical_x2.wald c(3)=c(4)=c(5)=c(6)=0
scalar F_wald_x2 = @val(empiricalx2_F(6,2))
scalar t_eqx2_y = ARDL_empirical_x2.@tstats(2)
scalar f2_eqx2_x = @val(empiricalx2_F2(6,2))
'scalar t_eqx2_x = ARDL_empirical_x2.@tstats(3)

for !ic = 1 to !coef_numx2
eq_x2_coefs(!ic) = ARDL_empirical_x2.@coefs(!ic)
next

' ----------------------------------------------------------- Unrestricted Model X3 ---------------------------------------------------
group det_grpx3 {%10} {%11} {%12} {%13} 			'group of deterministic components for MODEL X3
!num_detx3 = det_grpx3.@count
!coef_numx3=5*!maxlag+6 + !num_detx3 				'number of coefficients total
!coef_num_no_detx3=5*!maxlag+6 						'number of coefficients, excluding deterministics
!coef_num_maxx3=5*!maxlag+10 							'maximum number of coefficients, allowing up to four deterministics
scalar check_coef_numx3=!coef_numx3
scalar check_num_detx3=!num_detx3

vector(!coef_num_maxx3) eq_x3_coefs = 0 				'sets number of parameters in one equation;
smpl %1st "2020" 												'estimation sample
if !maxlag = 0 then
equation ARDL_empirical_x3.ls dx3 c y(-1) x(-1) x1(-1) x2(-1) x3(-1) {%10} {%11} {%12} {%13}
else
equation ARDL_empirical_x3.ls dx3 c y(-1) x(-1) x1(-1) x2(-1) x3(-1) dy(-!maxlag) dx(0) dx1(0) dx2(0) dx3(0) {%10} {%11} {%12} 'dy(-1 to -!maxlag) dx(-1 to -!maxlag) {%10} {%11} {%12} {%13}
endif

ARDL_empirical_x3.makeresids resids_x3				

' Values of F- and t stats are saved in tables called empirical_x3.

freeze(mode=overwrite, empiricalx3_F) ARDL_empirical_x3.wald c(2)=c(3)=c(4)=c(5)=c(6)=0
freeze(mode=overwrite, empiricalx3_F2) ARDL_empirical_x3.wald c(3)=c(4)=c(5)=c(6)=0
scalar F_wald_x3 = @val(empiricalx3_F(6,2))
scalar t_eqx3_y = ARDL_empirical_x3.@tstats(2)
scalar f2_eqx3_x = @val(empiricalx3_F2(6,2))
'scalar t_eqx3_x = ARDL_empirical_x3.@tstats(3)

for !ic = 1 to !coef_numx3
eq_x3_coefs(!ic) = ARDL_empirical_x3.@coefs(!ic)
next

' ----------------------------------------------------------- Unrestricted Model X4 ---------------------------------------------------
'group det_grpx4 {%10} {%11} {%12} {%13} 			'group of deterministic components for MODEL X4
'!num_detx4 = det_grpx4.@count
'!coef_numx4=5*!maxlag+6 + !num_detx4 				'number of coefficients total
'!coef_num_no_detx4=5*!maxlag+6 						'number of coefficients, excluding deterministics
'!coef_num_maxx4=5*!maxlag+10 							'maximum number of coefficients, allowing up to four deterministics
'scalar check_coef_numx4=!coef_numx4
'scalar check_num_detx4=!num_detx4

'vector(!coef_num_maxx4) eq_x4_coefs = 0 				'sets number of parameters in one equation;
'smpl %1st "2020" 												'estimation sample
'if !maxlag = 0 then
'equation ARDL_empirical_x4.ls dx4 c y(-1) x(-1) x1(-1) x2(-1) x3(-1) {%10} {%11} {%12} {%13}
'else
'equation ARDL_empirical_x4.ls dx4 c y(-1) x(-1) x1(-1) x2(-1) x3(-1) x4(-1) dy(-!maxlag) dx(0) dx1(0) dx2(0) dx3(0) dx4(0) {%10} {%11} {%12} 'dy(-1 to -!maxlag) dx(-1 to -!maxlag) {%10} {%11} {%12} {%13}
'endif

'ARDL_empirical_x4.makeresids resids_x4				

' Values of F- and t stats are saved in tables called empirical_x4.

'freeze(mode=overwrite, empiricalx4_F) ARDL_empirical_x4.wald c(2)=c(3)=c(4)=c(5)=c(6)=c(7)=0
'freeze(mode=overwrite, empiricalx4_F2) ARDL_empirical_x4.wald c(3)=c(4)=c(5)=c(6)=c(7)=0
'scalar F_wald_x4 = @val(empiricalx4_F(6,2))
'scalar t_eqx4_y = ARDL_empirical_x4.@tstats(2)
'scalar f2_eqx4_x = @val(empiricalx4_F2(6,2))
'scalar t_eqx4_x = ARDL_empirical_x4.@tstats(3)

'for !ic = 1 to !coef_numx4
'eq_x4_coefs(!ic) = ARDL_empirical_x4.@coefs(!ic)
'next


' ----------------------------------------------------------- Restricted Model Y ----------------------------------------------------------------

!coef_num_Ry =5*!maxlag+1 + !num_det 						'number of coefficients total
!coef_num_no_det_Ry=5*!maxlag+1 								'number of coefficients, excluding deterministics
!coef_num_max_Ry=5*!maxlag+5 									'maximum number of coefficients, allowing up to four deterministics
scalar check_coef_num_Ry=!coef_num_Ry

vector(!coef_num_max_Ry) eq_Ry_coefs = 0 					'sets number of parameters in one equation;

smpl %1st "2020" 															'estimation sample
if !maxlag = 0 then
equation ARDL_empirical_Ry.ls dy c {%6} {%7} {%8} {%9}
else
equation ARDL_empirical_Ry.ls dy c dy(-!maxlag) dx(0) dx1(0) dx2(0) dx3(0) {%6} {%7} {%8} {%9} 'dy(-1 to -!maxlag) dx(-1 to -!maxlag) {%6} {%7} {%8} {%9}
endif

ARDL_empirical_Ry.makeresids resids_Ry

for !ic = 1 to !coef_num_Ry
eq_Ry_coefs(!ic) = ARDL_empirical_Ry.@coefs(!ic)
next

' --------------------------------------------------------------------------------------------------------------------------------------------

' Recenter residuals
scalar sum_resids_y = @csum(resids_y)
scalar sum_resids_x = @csum(resids_x)
scalar sum_resids_x1 = @csum(resids_x1)
scalar sum_resids_x2 = @csum(resids_x2)
scalar sum_resids_x3 = @csum(resids_x3)
'scalar sum_resids_x4 = @csum(resids_x4)
'scalar sum_resids_x5 = @csum(resids_x5)
scalar sum_resids_Ry = @csum(resids_Ry)

for !a = %1st to "2020"
genr resids_y(!a) = resids_y(!a) - sum_resids_y/(!nobs-2)
genr resids_x(!a) = resids_x(!a) - sum_resids_x/(!nobs-2)
genr resids_x1(!a) = resids_x1(!a) - sum_resids_x1/(!nobs-2)
genr resids_x2(!a) = resids_x2(!a) - sum_resids_x2/(!nobs-2)
genr resids_x3(!a) = resids_x3(!a) - sum_resids_x3/(!nobs-2)
'genr resids_x4(!a) = resids_x4(!a) - sum_resids_x4/(!nobs-2)
'genr resids_x5(!a) = resids_x5(!a) - sum_resids_x5/(!nobs-2)
genr resids_Ry(!a) = resids_Ry(!a) - sum_resids_Ry/(!nobs-2)
next

' ===================== BOOTSTRAP PROCEDURE START HERE ========================
' begin bootstrap loop
for !ib = 1 to !nrep

' /////////////////////////////////////////////////////////////// Equation Y Estimation /////////////////////////////////////////////////////////////////
smpl %beg_extra "2020"

series y_b=0
series dy_b=0
series dify_b=0
series x_b=0
series dx_b=0
series difx_b=0
series x1_b=0
series dx1_b=0
series difx1_b=0
series x2_b=0
series dx2_b=0
series difx2_b=0
series x3_b=0
series dx3_b=0
series difx3_b=0
'series x4_b=0
'series dx4_b=0
'series difx4_b=0
'series x5_b=0
'series dx5_b=0
'series difx5_b=0


smpl %1st "2020"

' Resample the observation with replacement.
group gu resids_x resids_x1 resids_x2 resids_x3 resids_Ry

gu.resample(dropna, outsmpl=%beg_extra "2020", name=gu_b)


' ---------------------------------------------------------- Bootstrap series Y & X --------------------------------------------------
for !i=!start1 to !last 															' for each obs from first obs after start-up to last available
	if !maxlag = 0 then
	dify_b(!i)=0
	difx_b(!i)=0
	difx1_b(!i)=0
	difx2_b(!i)=0
	difx3_b(!i)=0
	'difx4_b(!i)=0
	'difx5_b(!i)=0
	else

	for !ilag=1 to !maxlag 													' this loop fills in the lagged diff terms
	dify_b(!i)=dify_b(!i) + eq_Ry_coefs(1+!ilag)*dy_b(!i-!ilag) + eq_Ry_coefs(1+!maxlag+!ilag)*dx_b(!i) + eq_Ry_coefs(2+!maxlag+!ilag)*dx1_b(!i) + eq_Ry_coefs(3+!maxlag+!ilag)*dx2_b(!i) + eq_Ry_coefs(4+!maxlag+!ilag)*dx3_b(!i)

	difx_b(!i)=difx_b(!i) + eq_x_coefs(6+!ilag)*dy_b(!i-!ilag) + eq_x_coefs(6+!maxlag+!ilag)*dx_b(!i) + eq_x_coefs(7+!maxlag+!ilag)*dx1_b(!i) + eq_x_coefs(8+!maxlag+!ilag)*dx2_b(!i) + eq_x_coefs(9+!maxlag+!ilag)*dx3_b(!i)

	difx1_b(!i)=difx1_b(!i) + eq_x1_coefs(6+!ilag)*dy_b(!i-!ilag) + eq_x1_coefs(6+!maxlag+!ilag)*dx_b(!i) + eq_x1_coefs(7+!maxlag+!ilag)*dx1_b(!i) + eq_x1_coefs(8+!maxlag+!ilag)*dx2_b(!i) + eq_x1_coefs(9+!maxlag+!ilag)*dx3_b(!i) 

	difx2_b(!i)=difx2_b(!i) + eq_x2_coefs(6+!ilag)*dy_b(!i-!ilag) + eq_x2_coefs(6+!maxlag+!ilag)*dx_b(!i) + eq_x2_coefs(7+!maxlag+!ilag)*dx1_b(!i) + eq_x2_coefs(8+!maxlag+!ilag)*dx2_b(!i) + eq_x2_coefs(9+!maxlag+!ilag)*dx3_b(!i)

	difx3_b(!i)=difx3_b(!i) + eq_x3_coefs(6+!ilag)*dy_b(!i-!ilag) + eq_x3_coefs(6+!maxlag+!ilag)*dx_b(!i) + eq_x3_coefs(7+!maxlag+!ilag)*dx1_b(!i) + eq_x3_coefs(8+!maxlag+!ilag)*dx2_b(!i) + eq_x3_coefs(9+!maxlag+!ilag)*dx3_b(!i)

	'difx4_b(!i)=difx4_b(!i) + eq_x4_coefs(7+!ilag)*dy_b(!i-!ilag) + eq_x4_coefs(7+!maxlag+!ilag)*dx_b(!i) + eq_x4_coefs(8+!maxlag+!ilag)*dx1_b(!i) + eq_x4_coefs(9+!maxlag+!ilag)*dx2_b(!i) + eq_x4_coefs(10+!maxlag+!ilag)*dx3_b(!i) + eq_x4_coefs(11+!maxlag+!ilag)*dx4_b(!i)

'	difx5_b(!i)=difx5_b(!i) + eq_x1_coefs(3+!ilag)*dy_b(!i-!ilag) + eq_x1_coefs(3+!maxlag+!ilag)*dx1_b(!i-!ilag)
	next
	endif

if !i<!1st then 																	'exclude dummies for start-up obs
	dy_b(!i)=eq_Ry_coefs(1)+ dify_b(!i) + resids_Ry_b(!i)

	dx_b(!i)=eq_x_coefs(1) + eq_x_coefs(2)*y_b(!i-1) + eq_x_coefs(3)*x_b(!i-1) + eq_x_coefs(4)*x1_b(!i-1) + eq_x_coefs(5)*x2_b(!i-1) + eq_x_coefs(6)*x3_b(!i-1) + difx_b(!i) + resids_x_b(!i)

	dx1_b(!i)=eq_x1_coefs(1) + eq_x1_coefs(2)*y_b(!i-1) + eq_x1_coefs(3)*x_b(!i-1) + eq_x1_coefs(4)*x1_b(!i-1) + eq_x1_coefs(5)*x2_b(!i-1) + eq_x1_coefs(6)*x3_b(!i-1) + difx1_b(!i) + resids_x1_b(!i)

	dx2_b(!i)=eq_x2_coefs(1) + eq_x2_coefs(2)*y_b(!i-1) + eq_x2_coefs(3)*x_b(!i-1) + eq_x2_coefs(4)*x1_b(!i-1) + eq_x2_coefs(5)*x2_b(!i-1) + eq_x2_coefs(6)*x3_b(!i-1) + difx2_b(!i) + resids_x2_b(!i)

	dx3_b(!i)=eq_x3_coefs(1) + eq_x3_coefs(2)*y_b(!i-1) + eq_x3_coefs(3)*x_b(!i-1) + eq_x3_coefs(4)*x1_b(!i-1) + eq_x3_coefs(5)*x2_b(!i-1) + eq_x3_coefs(6)*x3_b(!i-1) + difx3_b(!i) + resids_x3_b(!i)

	'dx4_b(!i)=eq_x4_coefs(1) + eq_x4_coefs(2)*y_b(!i-1) + eq_x4_coefs(3)*x_b(!i-1) + eq_x4_coefs(4)*x1_b(!i-1) + eq_x4_coefs(5)*x2_b(!i-1) + eq_x4_coefs(6)*x3_b(!i-1) + eq_x4_coefs(7)*x4_b(!i-1) + difx4_b(!i) + resids_x4_b(!i)

	'dx_b(!i)=eq_x_coefs(1) + eq_x_coefs(2)*y_b(!i-1) + eq_x_coefs(3)*x_b(!i-1) + difx_b(!i) + resids_x_b(!i)

else
	if !num_det=0 then
	dy_b(!i)=eq_Ry_coefs(1) + dify_b(!i) + resids_Ry_b(!i)
	else 																			'check y(-1), x(-1) omitted
	dy_b(!i)=eq_Ry_coefs(1) + dify_b(!i) + resids_Ry_b(!i) '+ eq_Ry_coefs(!coef_num_no_det_Ry+1)*{%6}(!i) + eq_Ry_coefs(!coef_num_no_det_Ry+2)*{%7}(!i) + eq_Ry_coefs(!coef_num_no_det_Ry+3)*{%8}(!i) + eq_Ry_coefs(!coef_num_no_det_Ry+4)*{%9}(!i) 
	endif

	if !num_detx=0 then
	dx_b(!i)=eq_x_coefs(1) + eq_x_coefs(2)*y_b(!i-1) + eq_x_coefs(3)*x_b(!i-1) + eq_x_coefs(4)*x1_b(!i-1) + eq_x_coefs(5)*x2_b(!i-1) + eq_x_coefs(6)*x3_b(!i-1) + difx_b(!i) + resids_x_b(!i)
	else
	dx_b(!i)=eq_x_coefs(1) + eq_x_coefs(2)*y_b(!i-1) + eq_x_coefs(3)*x_b(!i-1) + eq_x_coefs(4)*x1_b(!i-1) + eq_x_coefs(5)*x2_b(!i-1) + eq_x_coefs(6)*x3_b(!i-1) + difx_b(!i) + resids_x_b(!i) '+ eq_x_coefs(!coef_num_no_detx+1)*{%10}(!i) + eq_x_coefs(!coef_num_no_detx+2)*{%11}(!i) + eq_x_coefs(!coef_num_no_detx+3)*{%12}(!i) + eq_x_coefs(!coef_num_no_detx+4)*{%13}(!i) 
	endif

	if !num_detx1=0 then
	dx1_b(!i)=eq_x1_coefs(1) + eq_x1_coefs(2)*y_b(!i-1) + eq_x1_coefs(3)*x_b(!i-1) + eq_x1_coefs(4)*x1_b(!i-1) + eq_x1_coefs(5)*x2_b(!i-1) + eq_x1_coefs(6)*x3_b(!i-1) + difx1_b(!i) + resids_x1_b(!i)
	else
	dx1_b(!i)=eq_x1_coefs(1) + eq_x1_coefs(2)*y_b(!i-1) + eq_x1_coefs(3)*x_b(!i-1) + eq_x1_coefs(4)*x1_b(!i-1) + eq_x1_coefs(5)*x2_b(!i-1) + eq_x1_coefs(6)*x3_b(!i-1) + difx1_b(!i) + resids_x1_b(!i) '+ eq_x1_coefs(!coef_num_no_detx1+1)*{%10}(!i) + eq_x1_coefs(!coef_num_no_detx1+2)*{%11}(!i) + eq_x1_coefs(!coef_num_no_detx1+3)*{%12}(!i) + eq_x1_coefs(!coef_num_no_detx1+4)*{%13}(!i) 
	endif

	if !num_detx2=0 then
	dx2_b(!i)=eq_x2_coefs(1) + eq_x2_coefs(2)*y_b(!i-1) + eq_x2_coefs(3)*x_b(!i-1) + eq_x2_coefs(4)*x1_b(!i-1) + eq_x2_coefs(5)*x2_b(!i-1) + eq_x2_coefs(6)*x3_b(!i-1) + difx2_b(!i) + resids_x2_b(!i)
	else
	dx2_b(!i)=eq_x2_coefs(1) + eq_x2_coefs(2)*y_b(!i-1) + eq_x2_coefs(3)*x_b(!i-1) + eq_x2_coefs(4)*x1_b(!i-1) + eq_x2_coefs(5)*x2_b(!i-1) + eq_x2_coefs(6)*x3_b(!i-1) + difx2_b(!i) + resids_x2_b(!i) '+ eq_x2_coefs(!coef_num_no_detx2+1)*{%10}(!i) + eq_x2_coefs(!coef_num_no_detx2+2)*{%11}(!i) + eq_x2_coefs(!coef_num_no_detx2+3)*{%12}(!i) + eq_x2_coefs(!coef_num_no_detx2+4)*{%13}(!i)
	endif

	if !num_detx3=0 then
	dx3_b(!i)=eq_x3_coefs(1) + eq_x3_coefs(2)*y_b(!i-1) + eq_x3_coefs(3)*x_b(!i-1) + eq_x3_coefs(4)*x1_b(!i-1) + eq_x3_coefs(5)*x2_b(!i-1) + eq_x3_coefs(6)*x3_b(!i-1) + difx3_b(!i) 
	else
	dx3_b(!i)=eq_x3_coefs(1) + eq_x3_coefs(2)*y_b(!i-1) + eq_x3_coefs(3)*x_b(!i-1) + eq_x3_coefs(4)*x1_b(!i-1) + eq_x3_coefs(5)*x2_b(!i-1) + eq_x3_coefs(6)*x3_b(!i-1) + difx3_b(!i) + resids_x3_b(!i) '+ eq_x3_coefs(!coef_num_no_detx3+1)*{%10}(!i) + eq_x3_coefs(!coef_num_no_detx3+2)*{%11}(!i) + eq_x3_coefs(!coef_num_no_detx3+3)*{%12}(!i) + eq_x3_coefs(!coef_num_no_detx3+4)*{%13}(!i) 
	endif

'	if !num_detx4=0 then
'	dx4_b(!i)=eq_x4_coefs(1) + eq_x4_coefs(2)*y_b(!i-1) + eq_x4_coefs(3)*x_b(!i-1) + eq_x4_coefs(4)*x1_b(!i-1) + eq_x4_coefs(5)*x2_b(!i-1) + eq_x4_coefs(6)*x3_b(!i-1) + eq_x4_coefs(7)*x4_b(!i-1) + difx4_b(!i) + resids_x4_b(!i)
'	else
'	dx4_b(!i)=eq_x4_coefs(1) + eq_x4_coefs(2)*y_b(!i-1) + eq_x4_coefs(3)*x_b(!i-1) + eq_x4_coefs(4)*x1_b(!i-1) + eq_x4_coefs(5)*x2_b(!i-1) + eq_x4_coefs(6)*x3_b(!i-1) + eq_x4_coefs(7)*x4_b(!i-1) + difx4_b(!i) + resids_x4_b(!i) '+ eq_x4_coefs(!coef_num_no_detx4+1)*{%10}(!i) + eq_x4_coefs(!coef_num_no_detx4+2)*{%11}(!i) + eq_x4_coefs(!coef_num_no_detx4+3)*{%12}(!i) + eq_x4_coefs(!coef_num_no_detx4+4)*{%13}(!i) 
'	endif
endif

y_b(!i) = y_b(!i-1) + dy_b(!i)
x_b(!i) = x_b(!i-1) + dx_b(!i)
x1_b(!i) = x1_b(!i-1) + dx1_b(!i)
x2_b(!i) = x2_b(!i-1) + dx2_b(!i)
x3_b(!i) = x3_b(!i-1) + dx3_b(!i)
'x4_b(!i) = x4_b(!i-1) + dx4_b(!i)
'x5_b(!i) = x5_b(!i-1) + dx5_b(!i)

next

' =================== Equation Y estimation using bootstrap data ========================
smpl %1st "2020"															'estimation sample
if !maxlag = 0 then
equation ARDL_bootstrap_y.ls dy_b c y_b(-1) x_b(-1) x1_b(-1) x2_b(-1) x3_b(-1) {%6} {%7} {%8} {%9}
else
equation ARDL_bootstrap_y.ls dy_b c y_b(-1) x_b(-1) x1_b(-1) x2_b(-1) x3_b(-1) dy(-!maxlag) dx_b(0) dx1_b(0) dx2_b(0) dx3_b(0) {%6} {%7} {%8} {%9} 'dy_b(-1 to -!maxlag) dx_b(-1 to -!maxlag) {%6} {%7} {%8} {%9}
endif

freeze(mode=overwrite, bootstrap_F) ARDL_bootstrap_y.wald c(2)=c(3)=c(4)=c(5)=c(6)=0
freeze(mode=overwrite, bootstrap_F2) ARDL_bootstrap_y.wald c(3)=c(4)=c(5)=c(6)=0
scalar F_wald_y_b = @val(bootstrap_F(6,2))
scalar t_eqy_y_b = ARDL_bootstrap_y.@tstats(2)
scalar f2_eqy_x_b = @val(bootstrap_F2(6,2))
'scalar t_eqy_x_b = ARDL_bootstrap_y.@tstats(3)

y_F_stat_b(!ib) = F_wald_y_b
y_dv_t_stat_b(!ib) = t_eqy_y_b
y_idv_t_stat_b(!ib) = f2_eqy_x_b


next

'====================== Tabular Display of ARDL Test Statistics ======================

smpl 1 3
series y_Fcv
series y_dv_tcv
series y_idv_tcv

smpl @all
!k=1
for %1 0.9 0.95 0.99
y_Fcv(!k) = @quantile(y_F_stat_b, %1)
y_idv_tcv(!k) = @quantile(y_idv_t_stat_b, %1)
!k = !k+1
next

!k = 1
for %2 0.1 0.05 0.01
y_dv_tcv(!k) = @quantile(y_dv_t_stat_b, %2)
!k = !k+1
next

vector(3) empirical_stat
empirical_stat(1) = F_wald_y
empirical_stat(2) = t_eqy_y
empirical_stat(3) = f2_eqy_x

matrix(4,3) bootstrap_cvalue
bootstrap_cvalue.fill(b=r) 0.9, 0.95, 0.99

for !t=1 to 3
bootstrap_cvalue(2,!t) = y_Fcv(!t)
bootstrap_cvalue(3,!t) = y_dv_tcv(!t)
bootstrap_cvalue(4,!t) = y_idv_tcv(!t)
next

show bootstrap_cvalue
show empirical_stat
stop

' ================================= END =================================

